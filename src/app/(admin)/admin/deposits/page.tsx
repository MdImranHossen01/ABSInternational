'use client';

import { useState, useEffect } from 'react';
import { 
    Check, 
    X, 
    Loader2, 
    ArrowUpCircle,
    User,
    Calendar,
    Wallet,
    CreditCard
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import Swal from 'sweetalert2';

export default function AdminDepositsPage() {
  const [deposits, setDeposits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  async function fetchDeposits() {
    try {
      const res = await fetch('/api/admin/deposits');
      if (res.ok) setDeposits(await res.json());
    } catch (err) {
      toast.error('Failed to load deposits list');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDeposits();
  }, []);

  const handleAction = async (txId: string, action: 'completed' | 'failed') => {
    const actStr = action === 'completed' ? 'Approve' : 'Reject';
    const result = await Swal.fire({
      title: `${actStr} Deposit?`,
      text: `Are you sure you want to mark this deposit notification as ${action === 'completed' ? 'approved' : 'rejected'}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: `Yes, ${actStr}!`,
      confirmButtonColor: action === 'completed' ? '#10b981' : '#ef4444'
    });

    if (!result.isConfirmed) return;

    setProcessingId(txId);
    try {
      const res = await fetch('/api/admin/deposits', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId: txId, status: action })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        fetchDeposits();
      } else {
        toast.error(data.message || 'Operation failed');
      }
    } catch (err) {
      toast.error('Connection issue');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white capitalize text-xs">Approved</Badge>;
      case 'pending':
        return <Badge className="bg-amber-500 hover:bg-amber-600 text-white capitalize text-xs">Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-500 hover:bg-red-600 text-white capitalize text-xs">Rejected</Badge>;
      default:
        return <Badge variant="outline" className="capitalize text-xs">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4 md:space-y-6 mt-2 md:mt-4 max-w-7xl mx-auto px-1 sm:px-4">
      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-slate-900">Deposit Approvals</h1>
        <p className="text-xs sm:text-sm text-muted-foreground font-medium mt-0.5">
          Verify transaction IDs (TxID) and credit matching balances to user wallets.
        </p>
      </div>

      <Card className="shadow-sm border">
        <CardHeader className="p-4 sm:p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base sm:text-lg font-bold">Member Deposit Queue</CardTitle>
              <CardDescription className="text-xs">Match TxIDs with MFS records and credit accounts</CardDescription>
            </div>
            <Badge variant="secondary" className="font-bold text-xs px-2.5 py-1">
              Total: {deposits.length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          {deposits.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-xs sm:text-sm font-medium">
              No deposit notifications recorded in queue.
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Member ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {deposits.map((d: any) => (
                      <TableRow key={d._id}>
                        <TableCell className="text-xs text-muted-foreground">{new Date(d.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="font-mono text-xs font-bold text-primary">{d.userId?.memberId || 'N/A'}</TableCell>
                        <TableCell className="font-bold">{d.userId?.name || 'N/A'}</TableCell>
                        <TableCell className="text-xs font-medium max-w-sm">{d.description}</TableCell>
                        <TableCell className="font-bold text-slate-900">৳{d.amount}</TableCell>
                        <TableCell>
                          {getStatusBadge(d.status)}
                        </TableCell>
                        <TableCell className="text-right">
                          {d.status === 'pending' && (
                            <div className="flex items-center justify-end gap-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleAction(d._id, 'completed')}
                                disabled={processingId === d._id}
                                className="border-emerald-500/20 text-emerald-600 hover:bg-emerald-50 h-8 font-semibold"
                              >
                                <Check className="h-3.5 w-3.5 mr-1" /> Approve
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleAction(d._id, 'failed')}
                                disabled={processingId === d._id}
                                className="border-red-500/20 text-red-600 hover:bg-red-50 h-8 font-semibold"
                              >
                                <X className="h-3.5 w-3.5 mr-1" /> Reject
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card System View */}
              <div className="md:hidden divide-y divide-slate-100">
                {deposits.map((d: any) => (
                  <div key={d._id} className="p-4 space-y-3 bg-white hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">{d.userId?.name || 'Unknown User'}</h4>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                          <span className="font-mono font-semibold text-primary">{d.userId?.memberId || 'No ID'}</span>
                          <span>•</span>
                          <span>{new Date(d.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-base font-black text-slate-900 block">৳{d.amount}</span>
                        {getStatusBadge(d.status)}
                      </div>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl space-y-1.5 border border-slate-100 text-xs">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Transaction Info / TxID</span>
                      <p className="font-medium text-slate-700 leading-relaxed break-words">{d.description}</p>
                    </div>

                    {d.status === 'pending' && (
                      <div className="flex gap-2 pt-1">
                        <Button 
                          onClick={() => handleAction(d._id, 'completed')}
                          disabled={processingId === d._id}
                          className="flex-1 h-9 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm"
                        >
                          <Check className="h-3.5 w-3.5 mr-1" /> Approve Deposit
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => handleAction(d._id, 'failed')}
                          disabled={processingId === d._id}
                          className="flex-1 h-9 rounded-xl border-red-200 text-red-600 hover:bg-red-50 font-bold text-xs"
                        >
                          <X className="h-3.5 w-3.5 mr-1" /> Reject
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
