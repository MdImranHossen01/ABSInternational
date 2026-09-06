'use client';

import { useState, useEffect } from 'react';
import { 
    ShieldCheck, 
    Check, 
    X, 
    Eye, 
    Loader2,
    User,
    CreditCard,
    Calendar,
    Hash
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

export default function AdminKycPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  async function fetchKycList() {
    try {
      const res = await fetch('/api/admin/kyc');
      if (res.ok) setUsers(await res.json());
    } catch (err) {
      toast.error('Failed to load KYC lists');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchKycList();
  }, []);

  const handleKycStatus = async (userId: string, action: 'Approved' | 'Rejected') => {
    const result = await Swal.fire({
      title: `${action} KYC?`,
      text: `Are you sure you want to mark this National ID status as ${action.toLowerCase()}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: `Yes, ${action}!`,
      confirmButtonColor: action === 'Approved' ? '#10b981' : '#ef4444'
    });

    if (!result.isConfirmed) return;

    setProcessingId(userId);
    try {
      const res = await fetch('/api/admin/kyc', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, status: action })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        fetchKycList();
      } else {
        toast.error(data.message || 'Verification update failed');
      }
    } catch (err) {
      toast.error('Connection issue');
    } finally {
      setProcessingId(null);
    }
  };

  const showNidPreview = (url: string, title: string) => {
    Swal.fire({
      title: title,
      imageUrl: url,
      imageAlt: title,
      confirmButtonColor: 'var(--primary)',
      width: '650px',
      background: 'white'
    });
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
      case 'Approved':
        return <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white capitalize text-xs">Approved</Badge>;
      case 'Pending':
        return <Badge className="bg-amber-500 hover:bg-amber-600 text-white capitalize text-xs">Pending</Badge>;
      case 'Rejected':
        return <Badge className="bg-red-500 hover:bg-red-600 text-white capitalize text-xs">Rejected</Badge>;
      default:
        return <Badge variant="outline" className="capitalize text-xs">{status || 'Not Submitted'}</Badge>;
    }
  };

  return (
    <div className="space-y-4 md:space-y-6 mt-2 md:mt-4 max-w-7xl mx-auto px-1 sm:px-4">
      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-slate-900">KYC Verification</h1>
        <p className="text-xs sm:text-sm text-muted-foreground font-medium mt-0.5">
          Verify member National ID submissions for activation & payouts.
        </p>
      </div>

      <Card className="shadow-sm border">
        <CardHeader className="p-4 sm:p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base sm:text-lg font-bold">Verification Submissions</CardTitle>
              <CardDescription className="text-xs">Manage documents and approval queues</CardDescription>
            </div>
            <Badge variant="secondary" className="font-bold text-xs px-2.5 py-1">
              Total: {users.length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          {users.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-xs sm:text-sm font-medium">
              No KYC submissions in verification queue.
            </div>
          ) : (
            <>
              {/* Desktop / Tablet Table View (hidden on small mobile screens) */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member ID</TableHead>
                      <TableHead>User Name</TableHead>
                      <TableHead>NID Number</TableHead>
                      <TableHead>Front View</TableHead>
                      <TableHead>Back View</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user: any) => (
                      <TableRow key={user._id}>
                        <TableCell className="font-mono text-xs font-bold text-primary">{user.memberId || '—'}</TableCell>
                        <TableCell className="font-bold">{user.name}</TableCell>
                        <TableCell className="font-mono text-xs">{user.nidNumber || 'Not provided'}</TableCell>
                        <TableCell>
                          {user.nidFrontImage ? (
                            <Button variant="ghost" size="sm" onClick={() => showNidPreview(user.nidFrontImage, 'NID Front View')} className="text-xs text-primary gap-1">
                              <Eye className="h-3.5 w-3.5" /> View Front
                            </Button>
                          ) : <span className="text-xs text-muted-foreground">No image</span>}
                        </TableCell>
                        <TableCell>
                          {user.nidBackImage ? (
                            <Button variant="ghost" size="sm" onClick={() => showNidPreview(user.nidBackImage, 'NID Back View')} className="text-xs text-primary gap-1">
                              <Eye className="h-3.5 w-3.5" /> View Back
                            </Button>
                          ) : <span className="text-xs text-muted-foreground">No image</span>}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(user.nidStatus)}
                        </TableCell>
                        <TableCell className="text-right">
                          {user.nidStatus === 'Pending' && (
                            <div className="flex items-center justify-end gap-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleKycStatus(user._id, 'Approved')}
                                disabled={processingId === user._id}
                                className="border-emerald-500/20 text-emerald-600 hover:bg-emerald-50 h-8 font-semibold"
                              >
                                <Check className="h-3.5 w-3.5 mr-1" /> Approve
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleKycStatus(user._id, 'Rejected')}
                                disabled={processingId === user._id}
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

              {/* Mobile Card View (optimized for mobile screens) */}
              <div className="md:hidden divide-y divide-slate-100">
                {users.map((user: any) => (
                  <div key={user._id} className="p-4 space-y-3 bg-white hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">{user.name}</h4>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                          <span className="font-mono font-semibold text-primary">{user.memberId || 'No ID'}</span>
                          <span>•</span>
                          <span className="truncate max-w-[150px]">{user.email}</span>
                        </div>
                      </div>
                      <div>
                        {getStatusBadge(user.nidStatus)}
                      </div>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl space-y-2 border border-slate-100 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <CreditCard className="h-3.5 w-3.5 text-slate-400" /> NID No:
                        </span>
                        <span className="font-mono font-bold text-slate-800">
                          {user.nidNumber || 'Not provided'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/60">
                        {user.nidFrontImage ? (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => showNidPreview(user.nidFrontImage, 'NID Front Photo')}
                            className="h-8 text-xs font-semibold w-full gap-1 border-slate-200"
                          >
                            <Eye className="h-3.5 w-3.5 text-primary" /> Front Photo
                          </Button>
                        ) : (
                          <div className="h-8 rounded-lg bg-slate-100 flex items-center justify-center text-[11px] text-muted-foreground">
                            No Front Photo
                          </div>
                        )}

                        {user.nidBackImage ? (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => showNidPreview(user.nidBackImage, 'NID Back Photo')}
                            className="h-8 text-xs font-semibold w-full gap-1 border-slate-200"
                          >
                            <Eye className="h-3.5 w-3.5 text-primary" /> Back Photo
                          </Button>
                        ) : (
                          <div className="h-8 rounded-lg bg-slate-100 flex items-center justify-center text-[11px] text-muted-foreground">
                            No Back Photo
                          </div>
                        )}
                      </div>
                    </div>

                    {user.nidStatus === 'Pending' && (
                      <div className="flex gap-2 pt-1">
                        <Button 
                          onClick={() => handleKycStatus(user._id, 'Approved')}
                          disabled={processingId === user._id}
                          className="flex-1 h-9 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm"
                        >
                          <Check className="h-3.5 w-3.5 mr-1" /> Approve NID
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => handleKycStatus(user._id, 'Rejected')}
                          disabled={processingId === user._id}
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
