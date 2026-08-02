import React from 'react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';

const mockPayments = [
  { id: 'PAY-1004', client: 'Aman Sharma', amount: '₹1,500', method: 'UPI', date: 'Today, 10:35 AM', status: 'Success' },
  { id: 'PAY-1003', client: 'Priya Patel', amount: '₹2,500', method: 'Credit Card', date: 'Today, 09:20 AM', status: 'Pending' },
  { id: 'PAY-1002', client: 'Rahul Verma', amount: '₹800', method: 'UPI', date: 'Yesterday', status: 'Success' },
  { id: 'PAY-1001', client: 'Vikram Singh', amount: '₹15,000', method: 'Bank Transfer', date: '2 days ago', status: 'Success' },
  { id: 'PAY-1000', client: 'Neha Gupta', amount: '₹1,200', method: 'UPI', date: '2 days ago', status: 'Failed' },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Success': return 'bg-emerald-100 text-emerald-700';
    case 'Pending': return 'bg-amber-100 text-amber-700';
    case 'Failed': return 'bg-red-100 text-red-700';
    default: return 'bg-slate-100 text-slate-700';
  }
};

export const RecentPaymentsTable = () => {
  return (
    <Card className="p-5 border border-slate-200 bg-white overflow-hidden flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-slate-900">Recent Transactions</h3>
        <button className="text-sm text-teal-600 font-medium hover:text-teal-700">View Earnings</button>
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-100">
              <TableHead className="text-slate-500 font-medium w-[100px]">Txn ID</TableHead>
              <TableHead className="text-slate-500 font-medium">Client</TableHead>
              <TableHead className="text-slate-500 font-medium">Amount</TableHead>
              <TableHead className="text-slate-500 font-medium">Method</TableHead>
              <TableHead className="text-slate-500 font-medium text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockPayments.map((pay) => (
              <TableRow key={pay.id} className="border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer">
                <TableCell className="font-medium text-slate-900">{pay.id}</TableCell>
                <TableCell className="text-slate-600">{pay.client}</TableCell>
                <TableCell className="text-slate-900 font-medium">{pay.amount}</TableCell>
                <TableCell className="text-slate-500 text-sm">{pay.method}</TableCell>
                <TableCell className="text-right">
                  <Badge variant="secondary" className={`${getStatusColor(pay.status)} border-0 font-medium`}>
                    {pay.status}
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
