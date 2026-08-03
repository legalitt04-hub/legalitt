import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import api from '../../lib/api';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Success': return 'bg-emerald-100 text-emerald-700';
    case 'Pending': return 'bg-amber-100 text-amber-700';
    case 'Failed': return 'bg-red-100 text-red-700';
    default: return 'bg-slate-100 text-slate-700';
  }
};

export const RecentPaymentsTable = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await api.get('/admin/earnings');
        if (res.data?.success && Array.isArray(res.data.data?.recentTransactions)) {
          setPayments(res.data.data.recentTransactions.slice(0, 5));
        }
      } catch (err) {
        console.error('Failed to load recent payments', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  return (
    <Card className="p-5 border border-slate-200 bg-white overflow-hidden flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-slate-900">Recent Transactions</h3>
        <a href="/earnings" className="text-sm text-teal-600 font-medium hover:text-teal-700">View Earnings</a>
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
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-6 text-slate-400">Loading transactions...</TableCell></TableRow>
            ) : payments.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-6 text-slate-400">No transactions recorded</TableCell></TableRow>
            ) : (
              payments.map((pay) => (
                <TableRow key={pay._id || pay.id} className="border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer">
                  <TableCell className="font-mono text-xs font-semibold text-slate-900">{(pay._id || pay.id || 'TXN').substring(0, 8)}</TableCell>
                  <TableCell className="text-slate-600">{pay.client?.name || pay.user?.name || 'Client'}</TableCell>
                  <TableCell className="text-slate-900 font-medium">₹{(pay.amount || 0).toLocaleString('en-IN')}</TableCell>
                  <TableCell className="text-slate-500 text-sm">{pay.method || 'Razorpay'}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant="secondary" className={`${getStatusColor(pay.status === 'paid' ? 'Success' : pay.status)} border-0 font-medium`}>
                      {pay.status === 'paid' ? 'Success' : pay.status || 'Success'}
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
