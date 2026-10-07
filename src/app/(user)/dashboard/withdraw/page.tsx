'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  ArrowDownCircle,
  Key,
  ShieldAlert,
  Loader2,
  Wallet,
  ArrowRight,
  History
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import Swal from 'sweetalert2';

export default function WithdrawPage() {
  const { data: session } = useSession();
  const [wallet, setWallet] = useState<any>(null);
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bkash');
  const [accountNumber, setAccountNumber] = useState('');
  const [pin, setPin] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      const res = await fetch('/api/user/wallet');
      if (res.ok) setWallet(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (session?.user) loadData();
  }, [session]);

  const withdrawableBalance = wallet?.balances?.withdrawalWallet || 0;
  const numAmount = Number(amount) || 0;
  const communityFee = Math.round(numAmount * 0.10 * 100) / 100;
  const netPayout = Math.max(0, Math.round((numAmount - communityFee) * 100) / 100);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !accountNumber || !pin) {
      toast.error('All fields including Security PIN are required');
      return;
    }

    if (!Number.isFinite(numAmount) || numAmount < 500) {
      toast.error('Minimum withdrawal amount is ৳500');
      return;
    }

    if (numAmount > withdrawableBalance) {
      toast.error('Withdrawal amount exceeds withdrawable balance');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/user/wallet/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: numAmount,
          paymentMethod,
          accountNumber,
          pin,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        Swal.fire({
          title: 'Withdrawal Submitted',
          html: `
            <div class="text-left space-y-2 text-sm">
              <p>Your withdrawal request has been submitted successfully.</p>
              <div class="p-3 bg-slate-50 rounded-lg border space-y-1 font-mono text-xs">
                <div class="flex justify-between"><span>Requested Amount:</span><b>৳${numAmount.toLocaleString()}</b></div>
                <div class="flex justify-between text-indigo-600"><span>10% Community Fund:</span><b>-৳${communityFee.toLocaleString()}</b></div>
                <div class="flex justify-between text-emerald-600 font-bold border-t pt-1"><span>Net Payout (আপনি পাবেন):</span><b>৳${netPayout.toLocaleString()}</b></div>
              </div>
            </div>
          `,
          icon: 'success',
          confirmButtonColor: 'var(--primary)',
        });
        setAmount('');
        setAccountNumber('');
        setPin('');
        loadData();
      } else {
        toast.error(data.message || 'Withdrawal failed');
      }
    } catch (err) {
      toast.error('Network connection error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Banner */}
      <div className="rounded-2xl bg-linear-to-r from-purple-700 via-indigo-700 to-primary p-6 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black">Withdraw Funds</h1>
            <p className="text-xs sm:text-sm opacity-90 mt-1 max-w-xl">
              Cash out your earnings directly to your personal bKash, Nagad, Rocket, or Bank account safely with your 4-digit PIN.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl text-right shrink-0 border border-white/15">
            <span className="text-xs uppercase tracking-wider block opacity-80">Withdrawable Balance</span>
            <span className="text-3xl font-black">৳{withdrawableBalance.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 border">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <ArrowDownCircle className="h-5 w-5 text-purple-600" /> New Withdrawal Request
            </CardTitle>
            <CardDescription>Enter payout details and verify with your transaction PIN.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">Payout Method</Label>
                  <Select value={paymentMethod} onValueChange={(val) => val && setPaymentMethod(val)}>
                    <SelectTrigger className="h-10 text-xs">
                      <SelectValue placeholder="Select Method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bkash">bKash (Personal)</SelectItem>
                      <SelectItem value="nagad">Nagad (Personal)</SelectItem>
                      <SelectItem value="rocket">Rocket</SelectItem>
                      <SelectItem value="bank">Bank Wire</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">Withdraw Amount (BDT)</Label>
                  <Input
                    type="number"
                    placeholder="Min 500"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="h-10 text-xs font-mono"
                    min="500"
                    required
                  />
                </div>
              </div>

              {/* Live 10% Community Fund Calculation Box */}
              {numAmount >= 500 && (
                <div className="p-3.5 rounded-xl bg-linear-to-r from-indigo-50/70 via-purple-50/70 to-emerald-50/70 dark:from-indigo-950/40 dark:via-purple-950/40 dark:to-emerald-950/40 border border-indigo-200/60 dark:border-indigo-800/40 space-y-2">
                  <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide flex items-center justify-between">
                    <span>Payout Breakdown</span>
                    <Badge className="bg-indigo-600 text-white text-[10px] py-0">10% Community Fund Rule</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs pt-1 border-t border-slate-200/80 dark:border-slate-800">
                    <div>
                      <span className="text-[10px] text-muted-foreground block">Withdrawal Amount</span>
                      <span className="font-bold font-mono text-slate-900 dark:text-slate-100">৳{numAmount.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-indigo-600 dark:text-indigo-400 block font-medium">Community Fund (10%)</span>
                      <span className="font-bold font-mono text-indigo-600 dark:text-indigo-400">-৳{communityFee.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block font-bold">Net Payout (আপনি পাবেন)</span>
                      <span className="font-black font-mono text-sm text-emerald-600 dark:text-emerald-400">৳{netPayout.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">Your Account / Mobile No</Label>
                  <Input
                    placeholder="e.g. 01712345678"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="h-10 text-xs font-mono"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">4-Digit Security PIN</Label>
                  <Input
                    type="password"
                    maxLength={4}
                    placeholder="Enter PIN"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    className="h-10 text-xs font-mono"
                    required
                  />
                </div>
              </div>

              <Button type="submit" disabled={submitting} className="w-full font-bold h-11 bg-purple-600 hover:bg-purple-700 text-white">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ArrowDownCircle className="h-4 w-4 mr-2" />}
                Confirm Withdrawal
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                <ShieldAlert className="h-4 w-4 text-purple-600" /> Withdrawal Policy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5 text-xs text-muted-foreground leading-relaxed">
              <p>• <strong>Minimum Cashout:</strong> ৳500 BDT.</p>
              <p>• <strong>Community Fund (10%):</strong> ১০% কমিউনিটি ফান্ডে জমা হবে (যেমন: ১,০০০ টাকা উইথড্র করলে আপনি পাবেন ৯০০ টাকা এবং ১০০ টাকা কমিউনিটি ফান্ডে যাবে)।</p>
              <p>• <strong>Processing Time:</strong> Processed within 24-48 business hours.</p>
              <p>• <strong>Verification:</strong> Please ensure NID KYC is verified on your profile.</p>
            </CardContent>
          </Card>

          <Link href="/dashboard/withdraw-history" className="block">
            <Button variant="outline" className="w-full text-xs font-bold h-11 justify-between">
              <span>View Withdraw History</span>
              <History className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
