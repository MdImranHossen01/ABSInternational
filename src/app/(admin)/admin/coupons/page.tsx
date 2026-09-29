'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Tag, 
  Calendar, 
  Users,
  Loader2,
  MoreVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { CouponForm } from '@/components/admin/CouponForm';
import Swal from 'sweetalert2';

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<any>(null);

  const fetchCoupons = async () => {
    try {
      const response = await fetch('/api/admin/coupons');
      if (response.ok) {
        const data = await response.json();
        setCoupons(data);
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.message || 'Failed to fetch coupons');
      }
    } catch (error) {
      toast.error('Failed to fetch coupons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'Delete Coupon?',
      text: 'Are you sure you want to delete this coupon? This cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Yes, delete it!'
    });

    if (!result.isConfirmed) return;

    try {
      const response = await fetch(`/api/admin/coupons/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Coupon deleted');
        fetchCoupons();
      } else {
        toast.error('Failed to delete coupon');
      }
    } catch (error) {
      toast.error('Error deleting coupon');
    }
  };

  const filteredCoupons = coupons.filter(coupon =>
    (coupon.code || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 space-y-4 py-4 md:py-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Coupons</h2>
          <p className="text-muted-foreground">Manage discount codes and promotional offers.</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger 
            render={
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" /> Add Coupon
              </Button>
            }
          />
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Coupon</DialogTitle>
              <DialogDescription>Fill in the details to create a new discount code.</DialogDescription>
            </DialogHeader>
            <CouponForm onSuccess={() => {
              setIsAddDialogOpen(false);
              fetchCoupons();
            }} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by coupon code..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="font-bold">Code</TableHead>
                <TableHead className="font-bold">Discount</TableHead>
                <TableHead className="font-bold">Min Purchase</TableHead>
                <TableHead className="font-bold">Expiry</TableHead>
                <TableHead className="font-bold">Usage</TableHead>
                <TableHead className="font-bold">Status</TableHead>
                <TableHead className="text-right font-bold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
                  </TableCell>
                </TableRow>
              ) : filteredCoupons.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    No coupons found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredCoupons.map((coupon) => (
                  <TableRow key={coupon._id} className="hover:bg-muted/30 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-primary" />
                        <span className="font-bold">{coupon.code}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {coupon.discountType === 'percentage' 
                        ? `${coupon.discountValue}%` 
                        : `৳${coupon.discountValue}`}
                    </TableCell>
                    <TableCell>৳{coupon.minPurchase}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-xs">
                        <Calendar className="h-3 w-3" />
                        {new Date(coupon.expiryDate).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-xs">
                        <Users className="h-3 w-3" />
                        {coupon.usedCount} / {coupon.usageLimit || '∞'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={coupon.isActive ? "default" : "secondary"}>
                        {coupon.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger 
                          render={
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          }
                        />
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditingCoupon(coupon)}>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => handleDelete(coupon._id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Cards View */}
        <div className="md:hidden divide-y divide-border">
          {loading ? (
            <div className="h-24 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : filteredCoupons.length === 0 ? (
            <div className="h-24 flex items-center justify-center text-sm text-muted-foreground">
              No coupons found.
            </div>
          ) : (
            filteredCoupons.map((coupon) => (
              <div key={coupon._id} className="p-3.5 space-y-2 bg-card">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-primary" />
                    <span className="font-bold text-sm tracking-wide">{coupon.code}</span>
                  </div>
                  <Badge variant={coupon.isActive ? "default" : "secondary"} className="text-[10px] px-1.5 py-0 h-4">
                    {coupon.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Discount</span>
                    <span className="font-bold text-emerald-600">
                      {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `৳${coupon.discountValue}`}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Min Purchase</span>
                    <span className="font-semibold">৳{coupon.minPurchase}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>Exp: {new Date(coupon.expiryDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span>{coupon.usedCount} / {coupon.usageLimit || '∞'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1 border-t">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-7 text-xs gap-1"
                    onClick={() => setEditingCoupon(coupon)}
                  >
                    <Edit className="h-3 w-3" /> Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-7 text-xs gap-1 text-destructive hover:bg-destructive/10"
                    onClick={() => handleDelete(coupon._id)}
                  >
                    <Trash2 className="h-3 w-3" /> Delete
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <Dialog open={!!editingCoupon} onOpenChange={() => setEditingCoupon(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Coupon</DialogTitle>
            <DialogDescription>Update the coupon details below.</DialogDescription>
          </DialogHeader>
          {editingCoupon && (
            <CouponForm 
              initialData={editingCoupon} 
              onSuccess={() => {
                setEditingCoupon(null);
                fetchCoupons();
              }} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

