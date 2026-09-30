'use client';

import { useState, useEffect } from 'react';
import { 
    Check, 
    X, 
    Loader2, 
    Eye,
    Calendar,
    Wallet,
    CreditCard,
    User,
    Phone,
    Mail,
    Hash,
    Copy,
    CheckCircle2
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import Swal from 'sweetalert2';

export default function AdminDepositsPage() {
  const [deposits, setDeposits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedDeposit, setSelectedDeposit] = useState<any | null>(null);
  const [copiedTxId, setCopiedTxId] = useState(false);

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
        if (selectedDeposit && selectedDeposit._id === txId) {
          setSelectedDeposit(null);
        }
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTxId(true);
    toast.success('TxID copied to clipboard');
    setTimeout(() => setCopiedTxId(false), 2000);
  };

  const parseDepositDetails = (desc: string) => {
    const methodMatch = desc?.match(/via\s+([A-Za-z0-9_-]+)/i);
    const senderMatch = desc?.match(/Sender:\s*([^,\)]+)/i);
    const txidMatch = desc?.match(/TxID:\s*([^,\)]+)/i);

    return {
      method: methodMatch ? methodMatch[1].toUpperCase() : 'MFS',
      sender: senderMatch ? senderMatch[1].trim() : 'N/A',
      txId: txidMatch ? txidMatch[1].trim() : '',
      raw: desc
    };
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
    <div className="space-y-4 md:space-y-6 mt-2 md:mt-4 w-full">
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
                          <div className="flex items-center justify-end gap-1.5">
                            {/* View Details Button */}
                            <Button 
                              variant="secondary" 
                              size="sm" 
                              onClick={() => setSelectedDeposit(d)}
                              className="h-8 text-xs font-semibold gap-1 px-2.5"
                            >
                              <Eye className="h-3.5 w-3.5" /> View
                            </Button>

                            {d.status === 'pending' && (
                              <>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => handleAction(d._id, 'completed')}
                                  disabled={processingId === d._id}
                                  className="border-emerald-500/20 text-emerald-600 hover:bg-emerald-50 h-8 font-semibold px-2.5"
                                >
                                  <Check className="h-3.5 w-3.5 mr-1" /> Approve
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => handleAction(d._id, 'failed')}
                                  disabled={processingId === d._id}
                                  className="border-red-500/20 text-red-600 hover:bg-red-50 h-8 font-semibold px-2.5"
                                >
                                  <X className="h-3.5 w-3.5 mr-1" /> Reject
                                </Button>
                              </>
                            )}
                          </div>
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

                    <div className="flex flex-col gap-2 pt-1">
                      <Button 
                        variant="secondary"
                        onClick={() => setSelectedDeposit(d)}
                        className="w-full h-8 rounded-xl font-bold text-xs gap-1"
                      >
                        <Eye className="h-3.5 w-3.5" /> View Details
                      </Button>

                      {d.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => handleAction(d._id, 'completed')}
                            disabled={processingId === d._id}
                            className="flex-1 h-9 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm"
                          >
                            <Check className="h-3.5 w-3.5 mr-1" /> Approve
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
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Deposit Details Popup Modal */}
      <Dialog open={Boolean(selectedDeposit)} onOpenChange={(open) => !open && setSelectedDeposit(null)}>
        <DialogContent className="max-w-lg p-0 overflow-hidden rounded-2xl">
          {selectedDeposit && (() => {
            const parsed = parseDepositDetails(selectedDeposit.description);
            return (
              <div className="space-y-0">
                <DialogHeader className="p-5 pb-3 border-b bg-slate-50/80">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <DialogTitle className="text-base font-bold flex items-center gap-2">
                        <Wallet className="h-5 w-5 text-primary" /> Deposit Request Details
                      </DialogTitle>
                      <DialogDescription className="text-xs mt-0.5">
                        Inspect payment information and verify against MFS records.
                      </DialogDescription>
                    </div>
                    {getStatusBadge(selectedDeposit.status)}
                  </div>
                </DialogHeader>

                <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
                  {/* Amount Highlight Card */}
                  <div className="flex items-center justify-between p-4 rounded-xl bg-primary/5 border border-primary/15">
                    <div>
                      <span className="text-xs font-semibold text-muted-foreground block">Deposit Amount</span>
                      <span className="text-2xl font-black text-primary">৳{selectedDeposit.amount?.toLocaleString()}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold text-muted-foreground block">Payment Gateway</span>
                      <Badge className="font-bold text-xs uppercase px-2.5 py-0.5 mt-0.5 bg-primary text-primary-foreground">
                        {parsed.method}
                      </Badge>
                    </div>
                  </div>

                  {/* Section 1: Member Information */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5" /> Member Details
                    </h4>
                    <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                      <div>
                        <span className="text-muted-foreground block text-[11px]">Full Name:</span>
                        <span className="font-bold text-slate-900">{selectedDeposit.userId?.name || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[11px]">Member ID:</span>
                        <span className="font-mono font-bold text-primary">{selectedDeposit.userId?.memberId || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[11px]">Mobile:</span>
                        <span className="font-medium text-slate-900 font-mono">{selectedDeposit.userId?.phone || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[11px]">Email:</span>
                        <span className="font-medium text-slate-900 truncate block">{selectedDeposit.userId?.email || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Section 2: MFS Transaction Details */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <CreditCard className="h-3.5 w-3.5" /> MFS / Payment Details
                    </h4>
                    <div className="space-y-2.5 p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <span className="text-muted-foreground block text-[11px]">Sender Mobile Number:</span>
                          <span className="font-mono font-bold text-slate-900 text-sm">{parsed.sender}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-[11px]">Transaction ID (TxID):</span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="font-mono font-bold text-primary text-sm bg-white px-2 py-0.5 rounded border border-slate-200">
                              {parsed.txId || 'N/A'}
                            </span>
                            {parsed.txId && (
                              <button
                                onClick={() => copyToClipboard(parsed.txId)}
                                className="p-1 hover:bg-slate-200 rounded text-slate-600 transition-colors"
                                title="Copy TxID"
                              >
                                {copiedTxId ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-200/60">
                        <span className="text-muted-foreground block text-[11px]">Full Raw Note:</span>
                        <p className="font-medium text-slate-700 mt-0.5 bg-white p-2 rounded border border-slate-200 text-[11px] leading-relaxed break-words">
                          {selectedDeposit.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Audit Information */}
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground px-1">
                    <span>Requested: {new Date(selectedDeposit.createdAt).toLocaleString()}</span>
                    <span className="font-mono">Ref: {selectedDeposit._id.slice(-8)}</span>
                  </div>
                </div>

                {/* Dialog Footer Actions */}
                <div className="p-4 border-t bg-slate-50 flex items-center justify-end gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setSelectedDeposit(null)}
                    className="h-9 px-4 text-xs font-semibold"
                  >
                    Close
                  </Button>

                  {selectedDeposit.status === 'pending' && (
                    <>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleAction(selectedDeposit._id, 'failed')}
                        disabled={processingId === selectedDeposit._id}
                        className="h-9 px-4 text-xs font-bold border-red-200 text-red-600 hover:bg-red-50"
                      >
                        <X className="h-3.5 w-3.5 mr-1" /> Reject Deposit
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={() => handleAction(selectedDeposit._id, 'completed')}
                        disabled={processingId === selectedDeposit._id}
                        className="h-9 px-4 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                      >
                        <Check className="h-3.5 w-3.5 mr-1" /> Approve Deposit
                      </Button>
                    </>
                  )}
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
