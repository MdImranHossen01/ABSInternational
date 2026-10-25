'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  ArrowUpCircle,
  Copy,
  CheckCircle2,
  AlertCircle,
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

export default function DepositPage() {
  const { data: session } = useSession();
  const [wallet, setWallet] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bkash');
  const [senderNumber, setSenderNumber] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [copiedNumber, setCopiedNumber] = useState('');

  const loadData = async () => {
    try {
      const [wRes, sRes] = await Promise.all([
        fetch('/api/user/wallet'),
        fetch('/api/settings'),
      ]);
      if (wRes.ok) setWallet(await wRes.json());
      if (sRes.ok) setSettings(await sRes.json());
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (session?.user) loadData();
  }, [session]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedNumber(text);
    toast.success('Number copied to clipboard');
    setTimeout(() => setCopiedNumber(''), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !senderNumber.trim()) {
      toast.error('Please enter the deposit amount and sender phone number');
      return;
    }

    const cleanTrxId = transactionId.trim().toUpperCase();
    const cleanSender = senderNumber.trim();
    const cleanNote = note.trim();
    const officialNumber = getMethodNumber().trim();

    if (cleanTrxId) {
      // Prevent users from submitting phone numbers as TrxID (common copy-paste mistake)
      const isPhoneNumber =
        /^01[3-9]\d{8}$/.test(cleanTrxId) ||
        /^(?:\+?8801|8801)[3-9]\d{8}$/.test(cleanTrxId) ||
        cleanTrxId === officialNumber ||
        cleanTrxId === cleanSender;

      if (isPhoneNumber) {
        Swal.fire({
          title: 'Invalid Transaction ID',
          text: 'Please enter a valid Transaction ID (TrxID) received via SMS (e.g., BL9A7K8PQ2), not a phone number. Or leave it blank if unavailable.',
          icon: 'warning',
          confirmButtonColor: '#2563eb',
        });
        return;
      }

      if (cleanTrxId.length < 4) {
        toast.error('Transaction ID is too short. Please check or leave blank.');
        return;
      }
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/user/wallet/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Number(amount),
          paymentMethod,
          senderNumber: cleanSender,
          transactionId: cleanTrxId || undefined,
          note: cleanNote || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        Swal.fire({
          title: 'Deposit Submitted',
          text: data.message || 'Your deposit request has been submitted for admin verification.',
          icon: 'success',
          confirmButtonColor: 'var(--primary)',
        });
        setAmount('');
        setSenderNumber('');
        setTransactionId('');
        setNote('');
        loadData();
      } else {
        toast.error(data.message || 'Deposit failed');
      }
    } catch (err) {
      toast.error('Network connection error');
    } finally {
      setSubmitting(false);
    }
  };

  const getMethodNumber = () => {
    const manualConfig = settings?.manualPaymentConfig;
    switch (paymentMethod) {
      case 'bkash':
        return manualConfig?.bkash?.number || '01898758495';
      case 'nagad':
        return manualConfig?.nagad?.number || '01898758495';
      case 'rocket':
        return manualConfig?.rocket?.number || '01898758495';
      default:
        return 'ABS International Ltd';
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Banner */}
      <div className="rounded-2xl bg-linear-to-r from-emerald-600 via-teal-700 to-primary p-6 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black">Deposit Funds</h1>
            <p className="text-xs sm:text-sm opacity-90 mt-1 max-w-xl">
              Add funds directly to your Deposit Wallet using bKash, Nagad, Rocket, or Direct Bank Transfer to purchase products and activate membership packages.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl text-right shrink-0 border border-white/15">
            <span className="text-xs uppercase tracking-wider block opacity-80">Current Deposit Wallet</span>
            <span className="text-3xl font-black">৳{(wallet?.balances?.depositWallet || 0).toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Deposit Form */}
        <Card className="md:col-span-2 border">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <ArrowUpCircle className="h-5 w-5 text-emerald-600" /> New Deposit Request
            </CardTitle>
            <CardDescription>Send funds to the company merchant/personal number, then submit transaction details.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">Payment Method</Label>
                  <Select value={paymentMethod} onValueChange={(val) => val && setPaymentMethod(val)}>
                    <SelectTrigger className="h-10 text-xs">
                      <SelectValue placeholder="Select Method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bkash">bKash (Send Money / Merchant)</SelectItem>
                      <SelectItem value="nagad">Nagad (Send Money / Merchant)</SelectItem>
                      <SelectItem value="rocket">Rocket</SelectItem>
                      <SelectItem value="bank">Bank Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">Deposit Amount (BDT)</Label>
                  <Input
                    type="number"
                    placeholder="e.g. 1500"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="h-10 text-xs"
                    min="100"
                    required
                  />
                </div>
              </div>

              {/* Number to send box */}
              <div className="p-3 bg-muted/50 border rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="text-muted-foreground block text-[11px]">Send money to Official {paymentMethod.toUpperCase()} Number:</span>
                  <span className="font-mono font-bold text-sm text-foreground">{getMethodNumber()}</span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(getMethodNumber())}
                  className="text-xs h-8"
                >
                  <Copy className="h-3.5 w-3.5 mr-1" />
                  {copiedNumber === getMethodNumber() ? 'Copied!' : 'Copy'}
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold flex items-center justify-between">
                    <span>Sender Phone / Account No</span>
                    <span className="text-[10px] text-emerald-600 font-semibold">* Required</span>
                  </Label>
                  <Input
                    placeholder="Your bKash/Nagad/Rocket number"
                    value={senderNumber}
                    onChange={(e) => setSenderNumber(e.target.value)}
                    className="h-10 text-xs font-mono"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold flex items-center justify-between">
                    <span>Transaction ID (TrxID)</span>
                    <span className="text-[10px] text-muted-foreground font-normal">Optional</span>
                  </Label>
                  <Input
                    placeholder="e.g. BL9A7K8PQ2 (If available)"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    className="h-10 text-xs font-mono uppercase"
                  />
                </div>
              </div>

              {/* Note / Remarks Field */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold flex items-center justify-between">
                  <span>Note / Remarks</span>
                  <span className="text-[10px] text-muted-foreground font-normal">Optional</span>
                </Label>
                <Input
                  placeholder="Additional note (e.g. sent from personal bKash, agent cash-in, reference)"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="h-10 text-xs"
                />
              </div>

              <Button type="submit" disabled={submitting} className="w-full font-bold h-11 bg-emerald-600 hover:bg-emerald-700 text-white">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ArrowUpCircle className="h-4 w-4 mr-2" />}
                Submit Deposit Verification
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Quick Instructions & History link */}
        <div className="space-y-4">
          <Card className="border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4 text-primary" /> Deposit Instructions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-muted-foreground leading-relaxed">
              <p>1. Copy the official number for your selected payment method.</p>
              <p>2. Open your bKash/Nagad app and complete "Send Money".</p>
              <p>3. Copy the TrxID and enter your sender number.</p>
              <p>4. Admin approval takes 5-30 minutes during business hours.</p>
            </CardContent>
          </Card>

          <Link href="/dashboard/deposit-history" className="block">
            <Button variant="outline" className="w-full text-xs font-bold h-11 justify-between">
              <span>View Deposit History</span>
              <History className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
