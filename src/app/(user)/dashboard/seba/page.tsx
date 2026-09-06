'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  Activity,
  Loader2,

  BadgeAlert
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
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

export default function SebaPage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingType, setBookingType] = useState<'doctor' | 'diagnostic' | 'ambulance'>('doctor');
  const [bookingDetails, setBookingDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function fetchSebaData() {
    try {
      const [profileRes, bookingsRes] = await Promise.all([
        fetch('/api/user/profile'),
        fetch('/api/user/seba')
      ]);

      if (!profileRes.ok || !bookingsRes.ok) {
        throw new Error('Failed response from server');
      }

      setProfile(await profileRes.json());
      setBookings(await bookingsRes.json());
    } catch (err) {
      toast.error('Failed to load Seba details');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (session?.user) {
      fetchSebaData();
    }
  }, [session]);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.isSubscriptionActive) {
      toast.error('Seba benefits require an active Premium Member subscription.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/user/seba', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: bookingType, details: bookingDetails })
      });
      const resData = await res.json();
      if (res.ok) {
        Swal.fire({
          title: 'Voucher Generated!',
          text: resData.message,
          icon: 'success',
          confirmButtonColor: 'var(--primary)'
        });
        setBookingDetails('');
        fetchSebaData();
      } else {
        toast.error(resData.message || 'Booking failed');
      }
    } catch (err) {
      toast.error('Connection failed');
    } finally {
      setSubmitting(false);
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
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-3xl font-black tracking-tight">Seba Benefit Hub</h1>
        <p className="text-xs sm:text-sm text-muted-foreground font-medium">Claim free medical consultations, ambulance dispatch, and diagnostics discount vouchers.</p>
      </div>

      {/* Digital Seba Card Container */}
      {profile?.isSebaCardGenerated && profile?.isSubscriptionActive ? (
        <Card className="max-w-2xl bg-linear-to-r from-emerald-600 to-teal-700 text-white rounded-2xl shadow-xl overflow-hidden relative">
          <div className="absolute right-0 bottom-0 opacity-10">
            <Activity className="h-48 w-48 sm:h-64 sm:w-64 translate-x-12 translate-y-12 sm:translate-x-20 sm:translate-y-20" />
          </div>
          <CardHeader className="p-4 sm:p-6 border-b border-white/10">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-base sm:text-xl font-bold tracking-tight">ABS DIGITAL SEBA CARD</CardTitle>
                <CardDescription className="text-emerald-100 text-[11px] sm:text-xs mt-0.5">Healthcare & Social Benefit Membership</CardDescription>
              </div>
              <Activity className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-200" />
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-emerald-100">Holder Name</div>
                <div className="font-bold text-sm sm:text-lg mt-0.5 truncate">{profile?.name}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-emerald-100">Card Number</div>
                <div className="font-mono font-bold text-sm sm:text-lg mt-0.5 truncate">{profile?.sebaCardNo || 'ABS-SEBA-PENDING'}</div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs pt-3 sm:pt-4 border-t border-white/10 text-emerald-100">
              <div className="flex items-center gap-1.5">Status: <Badge className="bg-white text-emerald-800 font-bold text-[10px]">ACTIVE BENEFICIARY</Badge></div>
              <div className="text-[11px]">ABS International Health Network</div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-red-500/20 bg-red-500/5 max-w-2xl">
          <CardContent className="p-4 sm:pt-6 flex gap-3 sm:gap-4 items-start">
            <BadgeAlert className="h-5 w-5 sm:h-6 sm:w-6 text-red-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-red-800">Seba Card Not Generated</h4>
              <p className="text-xs text-red-700 mt-1">Seba digital health benefit cards are automatically generated only for active Premium Members.</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">

        {/* Booking Request Form */}
        <Card className="lg:col-span-1 border shadow-xs bg-white">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">Book Seba Benefit</CardTitle>
            <CardDescription className="text-xs">Generate diagnostic discount or doctor consultation voucher.</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
            <form onSubmit={handleBooking} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs sm:text-sm">Benefit Type</Label>
                <select
                  value={bookingType}
                  onChange={(e) => setBookingType(e.target.value as any)}
                  className="w-full h-10 sm:h-11 rounded-lg border px-3 text-xs sm:text-sm outline-none focus:border-primary transition-all bg-white"
                  disabled={!profile?.isSubscriptionActive}
                >
                  <option value="doctor">1x Free MBBS Doctor Consultation</option>
                  <option value="diagnostic">50% Diagnostic Test Voucher</option>
                  <option value="ambulance">50% Emergency Ambulance Voucher</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs sm:text-sm">Additional Details / Patient Name</Label>
                <textarea
                  value={bookingDetails}
                  onChange={(e) => setBookingDetails(e.target.value)}
                  placeholder="Insert patient details or special queries..."
                  className="w-full h-20 sm:h-24 rounded-lg border p-3 text-xs sm:text-sm outline-none focus:border-primary resize-none"
                  disabled={!profile?.isSubscriptionActive}
                />
              </div>

              <Button
                type="submit"
                disabled={submitting || !profile?.isSubscriptionActive}
                className="w-full h-10 sm:h-11 font-bold rounded-lg text-xs sm:text-sm"
              >
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Generate Benefit Voucher
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Voucher list */}
        <Card className="lg:col-span-2 border shadow-xs bg-white">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">Your Seba Vouchers & History</CardTitle>
            <CardDescription className="text-xs">All issued medical consult vouchers and ambulance details.</CardDescription>
          </CardHeader>
          <CardContent className="p-0 sm:p-6 sm:pt-0">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Benefit Type</TableHead>
                    <TableHead>Voucher Code</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-10 text-muted-foreground text-xs">
                        No vouchers generated yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    bookings.map((booking: any) => (
                      <TableRow key={booking._id}>
                        <TableCell className="text-xs">{new Date(booking.bookingDate).toLocaleDateString()}</TableCell>
                        <TableCell className="capitalize text-xs font-bold">{booking.type}</TableCell>
                        <TableCell className="font-mono text-xs font-bold text-primary">{booking.voucherCode}</TableCell>
                        <TableCell>
                          <Badge variant={booking.status === 'Completed' ? 'default' : 'secondary'} className="text-[10px]">
                            {booking.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Cards View */}
            <div className="md:hidden divide-y divide-slate-100">
              {bookings.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground">No vouchers generated yet.</div>
              ) : (
                bookings.map((booking: any) => (
                  <div key={booking._id} className="p-4 space-y-2 bg-white hover:bg-slate-50/50">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs sm:text-sm text-slate-900 capitalize">{booking.type}</span>
                      <Badge variant={booking.status === 'Completed' ? 'default' : 'secondary'} className="text-[10px]">
                        {booking.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs bg-slate-50 p-2 rounded-lg border border-slate-100 font-mono">
                      <span className="text-primary font-bold">{booking.voucherCode}</span>
                      <span className="text-slate-400 text-[11px]">{new Date(booking.bookingDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
