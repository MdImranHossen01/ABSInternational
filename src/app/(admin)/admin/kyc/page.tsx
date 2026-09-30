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
  Hash,
  Phone,
  Mail,
  MapPin,
  Camera,
  FileCheck2,
  ExternalLink
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
import Image from 'next/image';

export default function AdminKycPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  async function fetchKycList() {
    try {
      const res = await fetch('/api/admin/kyc');
      if (res.ok) setUsers(await res.json());
    } catch {
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
        if (selectedUser?._id === userId) {
          setSelectedUser((prev: any) => prev ? { ...prev, nidStatus: action } : null);
        }
        fetchKycList();
      } else {
        toast.error(data.message || 'Verification update failed');
      }
    } catch {
      toast.error('Connection issue');
    } finally {
      setProcessingId(null);
    }
  };

  const showPhotoPreview = (url: string, title: string) => {
    Swal.fire({
      title: title,
      imageUrl: url,
      imageAlt: title,
      confirmButtonColor: 'var(--primary)',
      width: '650px',
      background: 'white'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white capitalize text-xs">Approved</Badge>;
      case 'Pending':
        return <Badge className="bg-amber-500 hover:bg-amber-600 text-white capitalize text-xs">Pending</Badge>;
      case 'Rejected':
        return <Badge className="bg-red-500 hover:bg-red-600 text-white capitalize text-xs">Rejected</Badge>;
      default:
        return <Badge variant="outline" className="capitalize text-xs">{status || 'Not Submitted'}</Badge>;
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
    <div className="space-y-4 md:space-y-6 mt-2 md:mt-4 w-full">
      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
          KYC & Identity Verification Queue
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground font-medium mt-0.5">
          Review member National ID details, contact verification, and photos for account activation.
        </p>
      </div>

      <Card className="shadow-sm border">
        <CardHeader className="p-4 sm:p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base sm:text-lg font-bold">Verification Submissions</CardTitle>
              <CardDescription className="text-xs">Manage submitted documents and review identity profiles</CardDescription>
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
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member ID</TableHead>
                    <TableHead>Full Name / Contact</TableHead>
                    <TableHead>NID Number</TableHead>
                    <TableHead>Documents</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user: any) => (
                    <TableRow key={user._id}>
                      <TableCell className="font-mono text-xs font-bold text-primary">
                        {user.memberId || '—'}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-0.5">
                          <p className="font-bold text-sm text-foreground">{user.kycFullName || user.name}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 font-mono">
                            <Phone className="h-3 w-3" /> {user.phone || 'No phone'}
                          </p>
                          <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {user.email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs font-bold">
                        {user.nidNumber || 'Not provided'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {user.nidFrontImage && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => showPhotoPreview(user.nidFrontImage, 'NID Front Photo')} 
                              className="text-[11px] h-7 px-2 text-primary"
                            >
                              Front
                            </Button>
                          )}
                          {user.nidBackImage && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => showPhotoPreview(user.nidBackImage, 'NID Back Photo')} 
                              className="text-[11px] h-7 px-2 text-primary"
                            >
                              Back
                            </Button>
                          )}
                          {user.kycOwnerPhoto && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => showPhotoPreview(user.kycOwnerPhoto, 'Owner Photo')} 
                              className="text-[11px] h-7 px-2 text-primary"
                            >
                              Photo
                            </Button>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(user.nidStatus)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            onClick={() => setSelectedUser(user)}
                            className="text-xs h-8 font-medium gap-1"
                          >
                            <Eye className="h-3.5 w-3.5" /> Details
                          </Button>

                          {user.nidStatus === 'Pending' && (
                            <>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleKycStatus(user._id, 'Approved')}
                                disabled={processingId === user._id}
                                className="border-emerald-500/30 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 h-8 font-semibold"
                              >
                                <Check className="h-3.5 w-3.5 mr-1" /> Approve
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleKycStatus(user._id, 'Rejected')}
                                disabled={processingId === user._id}
                                className="border-red-500/30 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 h-8 font-semibold"
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
          )}
        </CardContent>
      </Card>

      {/* FULL KYC INSPECTION DIALOG */}
      {selectedUser && (
        <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-6 rounded-2xl">
            <DialogHeader className="border-b pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="text-lg font-black flex items-center gap-2">
                    <span>KYC Application Details</span>
                    {getStatusBadge(selectedUser.nidStatus)}
                  </DialogTitle>
                  <DialogDescription className="text-xs">
                    Member ID: <span className="font-mono font-bold text-primary">{selectedUser.memberId}</span>
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-5 pt-3">
              {/* Contact Details */}
              <div className="p-3.5 rounded-xl bg-muted/40 border space-y-2 text-xs">
                <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">1. Contact Information</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Mobile Number:</span>
                    <span className="font-bold text-foreground font-mono">
                      {selectedUser.phone || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Email Address:</span>
                    <span className="font-bold text-foreground">
                      {selectedUser.email || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* NID Details */}
              <div className="p-3.5 rounded-xl bg-muted/40 border space-y-2 text-xs">
                <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">2. National ID Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Full Name:</span>
                    <span className="font-bold text-foreground">{selectedUser.kycFullName || selectedUser.name}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">NID Number:</span>
                    <span className="font-bold text-foreground font-mono">{selectedUser.nidNumber || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Date of Birth:</span>
                    <span className="font-bold text-foreground">{selectedUser.kycDateOfBirth || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Father's Name:</span>
                    <span className="font-bold text-foreground">{selectedUser.kycFatherName || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Mother's Name:</span>
                    <span className="font-bold text-foreground">{selectedUser.kycMotherName || 'N/A'}</span>
                  </div>
                </div>

                <div className="pt-2 border-t space-y-2">
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Present Address:</span>
                    <span className="text-foreground font-medium">{selectedUser.kycPresentAddress || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Permanent Address:</span>
                    <span className="text-foreground font-medium">{selectedUser.kycPermanentAddress || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Photos */}
              <div className="space-y-2 text-xs">
                <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">3. Submitted Photos</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1 text-center">
                    <span className="font-bold text-[11px] block">NID Front</span>
                    {selectedUser.nidFrontImage ? (
                      <div 
                        className="relative aspect-video rounded-xl overflow-hidden border cursor-pointer hover:opacity-90"
                        onClick={() => showPhotoPreview(selectedUser.nidFrontImage, 'NID Front Photo')}
                      >
                        <Image src={selectedUser.nidFrontImage} alt="NID Front" fill className="object-cover" />
                      </div>
                    ) : (
                      <div className="aspect-video rounded-xl bg-muted flex items-center justify-center text-muted-foreground text-xs">
                        No photo
                      </div>
                    )}
                  </div>

                  <div className="space-y-1 text-center">
                    <span className="font-bold text-[11px] block">NID Back</span>
                    {selectedUser.nidBackImage ? (
                      <div 
                        className="relative aspect-video rounded-xl overflow-hidden border cursor-pointer hover:opacity-90"
                        onClick={() => showPhotoPreview(selectedUser.nidBackImage, 'NID Back Photo')}
                      >
                        <Image src={selectedUser.nidBackImage} alt="NID Back" fill className="object-cover" />
                      </div>
                    ) : (
                      <div className="aspect-video rounded-xl bg-muted flex items-center justify-center text-muted-foreground text-xs">
                        No photo
                      </div>
                    )}
                  </div>

                  <div className="space-y-1 text-center">
                    <span className="font-bold text-[11px] block">Owner Photo</span>
                    {selectedUser.kycOwnerPhoto ? (
                      <div 
                        className="relative aspect-square max-w-[120px] mx-auto rounded-xl overflow-hidden border cursor-pointer hover:opacity-90"
                        onClick={() => showPhotoPreview(selectedUser.kycOwnerPhoto, 'Owner Photo')}
                      >
                        <Image src={selectedUser.kycOwnerPhoto} alt="Owner" fill className="object-cover" />
                      </div>
                    ) : (
                      <div className="aspect-square max-w-[120px] mx-auto rounded-xl bg-muted flex items-center justify-center text-muted-foreground text-xs">
                        No photo
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons inside modal */}
              {selectedUser.nidStatus === 'Pending' && (
                <div className="flex items-center justify-end gap-3 pt-4 border-t">
                  <Button 
                    variant="outline" 
                    onClick={() => handleKycStatus(selectedUser._id, 'Rejected')}
                    disabled={processingId === selectedUser._id}
                    className="border-red-500/30 text-red-600 hover:bg-red-50 font-bold"
                  >
                    <X className="h-4 w-4 mr-1.5" /> Reject Application
                  </Button>
                  <Button 
                    onClick={() => handleKycStatus(selectedUser._id, 'Approved')}
                    disabled={processingId === selectedUser._id}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                  >
                    <Check className="h-4 w-4 mr-1.5" /> Approve KYC Application
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
