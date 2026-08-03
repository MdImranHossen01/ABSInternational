'use client';

import { useState, useEffect } from 'react';
import { 
    Check, 
    X, 
    Loader2 
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

  return (
    <div className="space-y-6 mt-4">
      <div>
        <h1 className="text-3xl font-black tracking-tight">Manual Deposit Approvals</h1>
        <p className="text-sm text-muted-foreground font-medium">Verify transaction IDs (TxID) and credit matching tokens to user wallets.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Member Deposit Notification Queue</CardTitle>
          <CardDescription>Match TxIDs with gateway records and credit accounts.</CardDescription>
        </CardHeader>
        <CardContent>
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
              {deposits.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-muted-foreground text-xs font-medium">
                    No deposit notifications recorded.
                  </TableCell>
                </TableRow>
              ) : (
                deposits.map((d: any) => (
                  <TableRow key={d._id}>
                    <TableCell className="text-xs">{new Date(d.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="font-mono text-xs font-bold">{d.userId?.memberId || 'N/A'}</TableCell>
                    <TableCell className="font-bold">{d.userId?.name || 'N/A'}</TableCell>
                    <TableCell className="text-xs font-medium max-w-sm">{d.description}</TableCell>
                    <TableCell className="font-bold text-slate-800">৳{d.amount}</TableCell>
                    <TableCell>
                      <Badge variant={d.status === 'completed' ? 'default' : d.status === 'pending' ? 'secondary' : 'destructive'} className="capitalize">
                        {d.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {d.status === 'pending' && (
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleAction(d._id, 'completed')}
                            disabled={processingId === d._id}
                            className="border-emerald-500/20 text-emerald-600 hover:bg-emerald-50 h-8"
                          >
                            <Check className="h-4 w-4 mr-1" /> Approve
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleAction(d._id, 'failed')}
                            disabled={processingId === d._id}
                            className="border-red-500/20 text-red-600 hover:bg-red-50 h-8"
                          >
                            <X className="h-4 w-4 mr-1" /> Reject
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
