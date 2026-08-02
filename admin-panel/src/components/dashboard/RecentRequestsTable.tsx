import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import api from '../../lib/api';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Completed': return 'bg-emerald-100 text-emerald-700';
    case 'In Progress': return 'bg-blue-100 text-blue-700';
    case 'Pending Review': return 'bg-amber-100 text-amber-700';
    case 'Payment Pending': return 'bg-red-100 text-red-700';
    default: return 'bg-slate-100 text-slate-700';
  }
};

export const RecentRequestsTable = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const res = await api.get('/admin/cases');
        if (res.data?.success && Array.isArray(res.data.data)) {
          setRequests(res.data.data.slice(0, 5));
        }
      } catch (err) {
        console.error('Failed to load recent requests', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCases();
  }, []);

  return (
    <Card className="p-5 border border-slate-200 bg-white overflow-hidden flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-slate-900">Recent Service Requests</h3>
        <a href="/cases" className="text-sm text-teal-600 font-medium hover:text-teal-700">View All</a>
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-100">
              <TableHead className="text-slate-500 font-medium w-[100px]">Case ID</TableHead>
              <TableHead className="text-slate-500 font-medium">Client</TableHead>
              <TableHead className="text-slate-500 font-medium">Service / Title</TableHead>
              <TableHead className="text-slate-500 font-medium">Date</TableHead>
              <TableHead className="text-slate-500 font-medium text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-6 text-slate-400">Loading cases...</TableCell></TableRow>
            ) : requests.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-6 text-slate-400">No active cases</TableCell></TableRow>
            ) : (
              requests.map((req) => (
                <TableRow key={req._id} className="border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer">
                  <TableCell className="font-mono text-xs font-semibold text-slate-900">{req._id?.substring(0, 8)}</TableCell>
                  <TableCell className="text-slate-600">{req.client?.name || 'Client'}</TableCell>
                  <TableCell className="text-slate-600 truncate max-w-[180px]">{req.title || req.type}</TableCell>
                  <TableCell className="text-slate-500 text-sm">{req.createdAt ? new Date(req.createdAt).toLocaleDateString() : 'Today'}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant="secondary" className={`${getStatusColor(req.status)} border-0 font-medium`}>
                      {req.status || 'Pending'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};
