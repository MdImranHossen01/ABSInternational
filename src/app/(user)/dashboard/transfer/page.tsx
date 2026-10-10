'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  Send,
  Loader2,
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
import { toast } from 'sonner';
import Swal from 'sweetalert2';

export default function TransferPage() {
  const { data: session } = useSession();
  const [wallet, setWallet] = useState<any>(null);
  const [amount, setAmount] = useState('');
  const [sourceWallet, setSourceWallet] = useState('depositWallet');
  const [targetMemberId, setTargetMemberId] = useState('');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !targetMemberId) {
      toast.error('All fields are required');
      return;
    }

    const numAmount = Number(amount);
    if (!Number.isFinite(numAmount) || numAmount < 50) {
      toast.error('Minimum transfer amount is ৳50');
      return;
    }

    const availableBalance = wallet?.balances?.[sourceWallet] ?? 0;
    if (numAmount > availableBalance) {
      toast.error('Transfer amount exceeds available wallet balance');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/user/wallet/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: numAmount,
          sourceWallet,
          targetMemberId: targetMemberId.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        Swal.fire({
          title: 'Transfer Completed',
          text: data.message || 'Balance transferred successfully.',
          icon: 'success',
          confirmButtonColor: 'var(--primary)',
        });
        setAmount('');
        setTargetMemberId('');
        loadData();
      } else {
        toast.error(data.message || 'Transfer failed');
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
      <div className="rounded-2xl bg-linear-to-r from-blue-700 via-indigo-700 to-primary p-6 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black">Transfer Funds (P2P)</h1>
            <p className="text-xs sm:text-sm opacity-90 mt-1 max-w-xl">
              Transfer funds instantly from your Deposit or Bonus Wallet to any registered ABS International member ID.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl text-right shrink-0 border border-white/15">
            <span className="text-xs uppercase tracking-wider block opacity-80">Deposit / Bonus Balance</span>
            <span className="text-2xl font-black">৳{(wallet?.balances?.depositWallet || 0).toLocaleString()} / ৳{(wallet?.balances?.bonusWallet || 0).toLocaleString()}</span>
          </div>
        </div>
      </div>

      <Card className="border">
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Send className="h-5 w-5 text-blue-600" /> Member-to-Member Internal Transfer
          </CardTitle>
          <CardDescription>Instant zero-fee transfer between member wallets</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Source Wallet</Label>
                <Select value={sourceWallet} onValueChange={(val) => val && setSourceWallet(val)}>
                  <SelectTrigger className="h-10 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="depositWallet">Deposit Wallet (৳{wallet?.balances?.depositWallet || 0})</SelectItem>
                    <SelectItem value="bonusWallet">Bonus Wallet (৳{wallet?.balances?.bonusWallet || 0})</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Transfer Amount (BDT)</Label>
                <Input
                  type="number"
                  placeholder="Min 50"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="h-10 text-xs"
                  min="50"
                  required
                />
              </div>
            </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">Recipient Member ID</Label>
                  <Input
                    placeholder="e.g. ABS123456"
                    value={targetMemberId}
                    onChange={(e) => setTargetMemberId(e.target.value)}
                    className="h-10 text-xs font-mono uppercase"
                    required
                  />
                </div>
              </div>

            <Button type="submit" disabled={submitting} className="w-full font-bold h-11 bg-blue-600 hover:bg-blue-700 text-white">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
              Send Transfer Instantly
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
