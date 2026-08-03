'use client';

import { useState, useEffect } from 'react';
import { 
    ShieldCheck, 
    Check, 
    X, 
    Eye, 
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
import Image from 'next/image';

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

  const showNidPreview = (url: string) => {
    Swal.fire({
      imageUrl: url,
      imageAlt: 'NID Photo Preview',
      confirmButtonColor: 'var(--primary)',
      width: '80%',
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

  return (
    <div className="space-y-6 mt-4">
      <div>
        <h1 className="text-3xl font-black tracking-tight">KYC NID Verification Queue</h1>
        <p className="text-sm text-muted-foreground font-medium">Verify member National IDs (NID cards) to allow account activation and secure withdrawals.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>NID Verification Submissions</CardTitle>
          <CardDescription>Verify user identity documents and update their status.</CardDescription>
        </CardHeader>
        <CardContent>
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
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-muted-foreground text-xs font-medium">
                    No KYC submissions in verification queue.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user: any) => (
                  <TableRow key={user._id}>
                    <TableCell className="font-mono text-xs font-bold">{user.memberId}</TableCell>
                    <TableCell className="font-bold">{user.name}</TableCell>
                    <TableCell className="font-mono text-xs">{user.nidNumber || 'Not provided'}</TableCell>
                    <TableCell>
                      {user.nidFrontImage ? (
                        <Button variant="ghost" size="sm" onClick={() => showNidPreview(user.nidFrontImage)} className="text-xs text-primary gap-1">
                          <Eye className="h-3.5 w-3.5" /> View Front
                        </Button>
                      ) : 'No image'}
                    </TableCell>
                    <TableCell>
                      {user.nidBackImage ? (
                        <Button variant="ghost" size="sm" onClick={() => showNidPreview(user.nidBackImage)} className="text-xs text-primary gap-1">
                          <Eye className="h-3.5 w-3.5" /> View Back
                        </Button>
                      ) : 'No image'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.nidStatus === 'Approved' ? 'default' : user.nidStatus === 'Pending' ? 'secondary' : 'outline'} className="capitalize">
                        {user.nidStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {user.nidStatus === 'Pending' && (
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleKycStatus(user._id, 'Approved')}
                            disabled={processingId === user._id}
                            className="border-emerald-500/20 text-emerald-600 hover:bg-emerald-50 h-8"
                          >
                            <Check className="h-4 w-4 mr-1" /> Approve
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleKycStatus(user._id, 'Rejected')}
                            disabled={processingId === user._id}
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
