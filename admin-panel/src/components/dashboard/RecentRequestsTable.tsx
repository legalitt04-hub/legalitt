import React from 'react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';

const mockRequests = [
  { id: 'REQ-802', client: 'Aman Sharma', service: 'Legal Notice', date: 'Today, 10:30 AM', status: 'Pending Review' },
  { id: 'REQ-801', client: 'Priya Patel', service: 'Property Search', date: 'Today, 09:15 AM', status: 'Payment Pending' },
  { id: 'REQ-800', client: 'Rahul Verma', service: 'FIR Draft', date: 'Yesterday', status: 'In Progress' },
  { id: 'REQ-799', client: 'Neha Gupta', service: 'Legal Advice', date: 'Yesterday', status: 'Completed' },
  { id: 'REQ-798', client: 'Vikram Singh', service: 'Court Marriage', date: '2 days ago', status: 'Completed' },
];

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
  return (
    <Card className="p-5 border border-slate-200 bg-white overflow-hidden flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-slate-900">Recent Service Requests</h3>
        <button className="text-sm text-teal-600 font-medium hover:text-teal-700">View All</button>
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-100">
              <TableHead className="text-slate-500 font-medium w-[100px]">Req ID</TableHead>
              <TableHead className="text-slate-500 font-medium">Client</TableHead>
              <TableHead className="text-slate-500 font-medium">Service</TableHead>
              <TableHead className="text-slate-500 font-medium">Date</TableHead>
              <TableHead className="text-slate-500 font-medium text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockRequests.map((req) => (
              <TableRow key={req.id} className="border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer">
                <TableCell className="font-medium text-slate-900">{req.id}</TableCell>
                <TableCell className="text-slate-600">{req.client}</TableCell>
                <TableCell className="text-slate-600">{req.service}</TableCell>
                <TableCell className="text-slate-500 text-sm">{req.date}</TableCell>
                <TableCell className="text-right">
                  <Badge variant="secondary" className={`${getStatusColor(req.status)} border-0 font-medium`}>
                    {req.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};
