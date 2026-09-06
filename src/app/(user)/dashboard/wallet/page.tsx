'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
    Wallet, 
    ArrowUpCircle, 
    ArrowDownCircle, 
    Send, 
    Key, 
    History, 
    Loader2, 
    AlertCircle,
    CheckCircle2,
    RefreshCw,
    Copy
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import Swal from 'sweetalert2';

export default function WalletPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [depositAmount, setDepositAmount] = useState('');
  const [depositMethod, setDepositMethod] = useState('bkash');
  const [depositSender, setDepositSender] = useState('');
  const [depositTxId, setDepositTxId] = useState('');

  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState('bkash');
  const [withdrawAccount, setWithdrawAccount] = useState('');
  const [withdrawPin, setWithdrawPin] = useState('');

  const [transferAmount, setTransferAmount] = useState('');
  const [transferSource, setTransferSource] = useState('depositWallet');
  const [transferTarget, setTransferTarget] = useState('');
  const [transferPin, setTransferPin] = useState('');

  const [pinNew, setPinNew] = useState('');
  const [pinOld, setPinOld] = useState('');

  // Convert form
  const [convertAmount, setConvertAmount] = useState('');
  const [convertPin, setConvertPin] = useState('');

  async function fetchWalletData() {
    try {
      const res = await fetch('/api/user/wallet');
      if (res.ok) {
        setData(await res.json());
      }
    } catch (err) {
      toast.error('Failed to load wallet data');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (session?.user) {
      fetchWalletData();
      fetch('/api/settings')
        .then((res) => res.json())
        .then((sData) => setSettings(sData))
        .catch((err) => console.error('Failed to load settings', err));
    }
  }, [session]);

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositAmount || !depositSender || !depositTxId) {
      toast.error('All fields are required');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/user/wallet/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Number(depositAmount),
          paymentMethod: depositMethod,
          senderNumber: depositSender,
          transactionId: depositTxId
        })
      });
      const resData = await res.json();
      if (res.ok) {
        Swal.fire('Success', resData.message, 'success');
        setDepositAmount('');
        setDepositSender('');
        setDepositTxId('');
        fetchWalletData();
      } else {
        toast.error(resData.message || 'Deposit failed');
      }
    } catch (err) {
      toast.error('Network error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawAmount || !withdrawAccount || !withdrawPin) {
      toast.error('All fields are required');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/user/wallet/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Number(withdrawAmount),
          paymentMethod: withdrawMethod,
          accountNumber: withdrawAccount,
          pin: withdrawPin
        })
      });
      const resData = await res.json();
      if (res.ok) {
        Swal.fire('Success', resData.message, 'success');
        setWithdrawAmount('');
        setWithdrawAccount('');
        setWithdrawPin('');
        fetchWalletData();
      } else {
        toast.error(resData.message || 'Withdrawal failed');
      }
    } catch (err) {
      toast.error('Network error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferAmount || !transferTarget || !transferPin) {
      toast.error('All fields are required');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/user/wallet/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Number(transferAmount),
          sourceWallet: transferSource,
          targetMemberId: transferTarget,
          pin: transferPin
        })
      });
      const resData = await res.json();
      if (res.ok) {
        Swal.fire('Success', resData.message, 'success');
        setTransferAmount('');
        setTransferTarget('');
        setTransferPin('');
        fetchWalletData();
      } else {
        toast.error(resData.message || 'Transfer failed');
      }
    } catch (err) {
      toast.error('Network error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConvert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!convertAmount || !convertPin) {
      toast.error('All fields are required');
      return;
    }
    if (Number(convertAmount) <= 0) {
      toast.error('Enter a valid amount');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/user/wallet/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Number(convertAmount),
          pin: convertPin,
        }),
      });
      const resData = await res.json();
      if (res.ok) {
        Swal.fire('Success! 🎉', resData.message, 'success');
        setConvertAmount('');
        setConvertPin('');
        fetchWalletData();
      } else {
        toast.error(resData.message || 'Conversion failed');
      }
    } catch (err) {
      toast.error('Network error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdatePin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinNew) {
      toast.error('New PIN is required');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/user/wallet/pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pin: pinNew,
          oldPin: pinOld || undefined
        })
      });
      const resData = await res.json();
      if (res.ok) {
        Swal.fire('Success', resData.message, 'success');
        setPinNew('');
        setPinOld('');
      } else {
        toast.error(resData.message || 'Failed to update PIN');
      }
    } catch (err) {
      toast.error('Network error');
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold">Completed</Badge>;
      case 'pending': return <Badge className="bg-amber-500 hover:bg-amber-600 text-white font-bold">Pending</Badge>;
      case 'failed': return <Badge className="bg-red-500 hover:bg-red-600 text-white font-bold">Failed</Badge>;
      default: return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'deposit': return <Badge variant="outline" className="border-emerald-500 text-emerald-700">Deposit</Badge>;
      case 'withdrawal': return <Badge variant="outline" className="border-purple-500 text-purple-700">Withdrawal</Badge>;
      case 'transfer_out': return <Badge variant="outline" className="border-red-500 text-red-700">Sent</Badge>;
      case 'transfer_in': return <Badge variant="outline" className="border-blue-500 text-blue-700">Received</Badge>;
      case 'earned': return <Badge variant="outline" className="border-indigo-500 text-indigo-700">Bonus</Badge>;
      default: return <Badge variant="outline">Spent</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black tracking-tight">Wallet Orchestration</h1>
        <p className="text-sm text-muted-foreground font-medium">Deposit, withdraw, transfer tokens, and track unified statements.</p>
      </div>

      {/* Balance Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
        <Card className="border border-emerald-500/10 bg-emerald-500/[0.02]">
          <CardContent className="p-4 sm:pt-6 flex justify-between items-center">
            <div>
              <p className="text-[11px] sm:text-xs uppercase text-emerald-800 tracking-wider font-bold">Deposit Wallet</p>
              <div className="text-2xl sm:text-3xl font-black text-emerald-950 mt-1">৳{data?.balances?.depositWallet || 0}</div>
            </div>
            <div className="p-2.5 sm:p-3 bg-emerald-500/10 rounded-xl text-emerald-600"><Wallet className="h-5 w-5 sm:h-6 sm:w-6" /></div>
          </CardContent>
        </Card>
        <Card className="border border-blue-500/10 bg-blue-500/[0.02]">
          <CardContent className="p-4 sm:pt-6 flex justify-between items-center">
            <div>
              <p className="text-[11px] sm:text-xs uppercase text-blue-800 tracking-wider font-bold">Bonus Wallet</p>
              <div className="text-2xl sm:text-3xl font-black text-blue-950 mt-1">৳{data?.balances?.bonusWallet || 0}</div>
            </div>
            <div className="p-2.5 sm:p-3 bg-blue-500/10 rounded-xl text-blue-600"><History className="h-5 w-5 sm:h-6 sm:w-6" /></div>
          </CardContent>
        </Card>
        <Card className="border border-purple-500/10 bg-purple-500/[0.02]">
          <CardContent className="p-4 sm:pt-6 flex justify-between items-center">
            <div>
              <p className="text-[11px] sm:text-xs uppercase text-purple-800 tracking-wider font-bold">Withdrawal Wallet</p>
              <div className="text-2xl sm:text-3xl font-black text-purple-950 mt-1">৳{data?.balances?.withdrawalWallet || 0}</div>
            </div>
            <div className="p-2.5 sm:p-3 bg-purple-500/10 rounded-xl text-purple-600"><ArrowDownCircle className="h-5 w-5 sm:h-6 sm:w-6" /></div>
          </CardContent>
        </Card>
      </div>

      {/* ── Auto Profit Matrix ────────────────────────────────────────────── */}
      {data?.autoProfit && (
        <Card className="border border-violet-500/20 bg-violet-500/[0.02]">
          <CardHeader className="p-4 sm:p-6 pb-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <CardTitle className="text-sm sm:text-base font-bold">Auto Profit Matrix</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  প্রতিটি downline activation-এ ৫২ BDT আপনার personal pool-এ জমা হয়।
                  Pool নির্দিষ্ট tier threshold পৌঁছালে স্বয়ংক্রিয়ভাবে payout হয়।
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs text-muted-foreground">Completed Tiers</p>
                <p className="text-xl sm:text-2xl font-black text-violet-700">{data.autoProfit.completedTier} / 10</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0 space-y-4">
            {/* Current pool & progress */}
            {!data.autoProfit.isComplete ? (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-muted-foreground">Pool Balance: <strong className="text-foreground">৳{data.autoProfit.pool.toLocaleString()}</strong></span>
                  <span className="text-muted-foreground">Next Tier {data.autoProfit.completedTier + 1}: <strong className="text-violet-700">৳{(data.autoProfit.nextTierAmount || 0).toLocaleString()}</strong></span>
                </div>
                <div className="h-2.5 bg-violet-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-violet-500 rounded-full transition-all duration-700"
                    style={{ width: `${data.autoProfit.tierProgress}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="p-3 bg-violet-100 rounded-xl text-center text-xs font-bold text-violet-800">
                🎉 All 10 Auto Profit Tiers Completed! Total pool distributed to Bonus Wallet.
              </div>
            )}

            {/* 10 Tier badges */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {(data.autoProfit.allTiers || []).map((amt: number, idx: number) => {
                const done = idx < data.autoProfit.completedTier;
                const active = idx === data.autoProfit.completedTier;
                return (
                  <div
                    key={idx}
                    className={`rounded-xl border p-2 text-center transition-all ${
                      done
                        ? 'bg-violet-500 border-violet-500 text-white'
                        : active
                        ? 'bg-violet-50 border-violet-400 text-violet-700 ring-2 ring-violet-300'
                        : 'bg-muted/30 border-muted text-muted-foreground'
                    }`}
                  >
                    <p className="text-[9px] font-bold uppercase tracking-wide opacity-75">Tier {idx + 1}</p>
                    <p className="text-[11px] font-black mt-0.5">
                      {amt >= 1000000
                        ? `৳${(amt / 100000).toFixed(1)}L`
                        : amt >= 1000
                        ? `৳${(amt / 1000).toFixed(0)}K`
                        : `৳${amt}`}
                    </p>
                    {done && <p className="text-[9px] mt-0.5">✓ Done</p>}
                    {active && <p className="text-[9px] mt-0.5">← Next</p>}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="statement" className="w-full space-y-4 sm:space-y-6">
        <div className="overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
          <TabsList className="inline-flex w-auto min-w-full sm:min-w-0 sm:grid sm:grid-cols-6 bg-muted rounded-xl p-1 max-w-3xl">
            <TabsTrigger value="statement" className="rounded-lg gap-1.5 text-xs sm:text-sm py-1.5"><History className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Statement</TabsTrigger>
            <TabsTrigger value="deposit" className="rounded-lg gap-1.5 text-xs sm:text-sm py-1.5"><ArrowUpCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Deposit</TabsTrigger>
            <TabsTrigger value="withdraw" className="rounded-lg gap-1.5 text-xs sm:text-sm py-1.5"><ArrowDownCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Withdraw</TabsTrigger>
            <TabsTrigger value="convert" className="rounded-lg gap-1.5 text-blue-600 text-xs sm:text-sm py-1.5"><RefreshCw className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Convert</TabsTrigger>
            <TabsTrigger value="transfer" className="rounded-lg gap-1.5 text-xs sm:text-sm py-1.5"><Send className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Transfer</TabsTrigger>
            <TabsTrigger value="pin" className="rounded-lg gap-1.5 text-xs sm:text-sm py-1.5"><Key className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> PIN</TabsTrigger>
          </TabsList>
        </div>

        {/* Ledger Statement */}
        <TabsContent value="statement">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg">Unified Transaction Ledger</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Track all deposits, withdrawals, transfers, and bonus statements.</CardDescription>
            </CardHeader>
            <CardContent className="p-0 sm:p-6 sm:pt-0">
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.transactions?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                          No transactions recorded yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      data?.transactions?.map((tx: any) => (
                        <TableRow key={tx._id}>
                          <TableCell className="text-xs">{new Date(tx.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>{getTypeBadge(tx.type)}</TableCell>
                          <TableCell className="text-xs max-w-sm break-words font-medium">{tx.description}</TableCell>
                          <TableCell className="font-bold">৳{tx.amount}</TableCell>
                          <TableCell>{getStatusBadge(tx.status)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden divide-y divide-slate-100">
                {data?.transactions?.length === 0 ? (
                  <div className="p-8 text-center text-xs text-muted-foreground">No transactions recorded yet.</div>
                ) : (
                  data?.transactions?.map((tx: any) => (
                    <div key={tx._id} className="p-4 space-y-2 bg-white hover:bg-slate-50/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getTypeBadge(tx.type)}
                          <span className="text-xs text-slate-400">{new Date(tx.createdAt).toLocaleDateString()}</span>
                        </div>
                        <span className="font-black text-sm text-slate-900">৳{tx.amount}</span>
                      </div>
                      <p className="text-xs text-slate-700 font-medium">{tx.description}</p>
                      <div className="flex justify-end pt-1">
                        {getStatusBadge(tx.status)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Deposit Form */}
        <TabsContent value="deposit">
          <Card className="max-w-xl">
            <CardHeader>
              <CardTitle>Manual Deposit Request</CardTitle>
              <CardDescription>Send funds to the company Mobile banking number and insert credentials here.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleDeposit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <Select value={depositMethod} onValueChange={(val) => setDepositMethod(val || '')}>
                    <SelectTrigger className="h-11 rounded-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bkash">bKash</SelectItem>
                      <SelectItem value="nagad">Nagad</SelectItem>
                      <SelectItem value="rocket">Rocket</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Official Payment Account Information Box */}
                {(() => {
                  const methodConfig = settings?.manualPaymentConfig?.[depositMethod as keyof typeof settings.manualPaymentConfig] as { number?: string; qrCode?: string; active?: boolean } | undefined;
                  const methodNumber = methodConfig?.number;
                  const qrCode = methodConfig?.qrCode;
                  const methodName = depositMethod === 'bkash' ? 'bKash' : depositMethod === 'nagad' ? 'Nagad' : depositMethod === 'rocket' ? 'Rocket' : depositMethod;

                  return (
                    <div className="p-4 rounded-xl bg-primary/5 border border-primary/15 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                          Official Company {methodName} Number:
                        </span>
                        <Badge variant="outline" className="text-[10px] bg-primary/10 border-primary/20 text-primary font-semibold">
                          Send Money
                        </Badge>
                      </div>

                      {methodNumber ? (
                        <div className="flex items-center gap-2">
                          <p className="flex-1 font-mono text-base font-black tracking-wider text-primary bg-background px-3 py-2 rounded-lg border border-primary/20 select-all">
                            {methodNumber}
                          </p>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-10 px-3 font-semibold border-primary/30 hover:bg-primary hover:text-white transition-all shrink-0"
                            onClick={() => {
                              navigator.clipboard.writeText(methodNumber);
                              toast.success(`${methodName} number copied to clipboard!`);
                            }}
                          >
                            <Copy className="h-4 w-4 mr-1.5" />
                            Copy
                          </Button>
                        </div>
                      ) : (
                        <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/20 text-xs text-amber-700 dark:text-amber-400">
                          No official {methodName} number configured in admin settings yet. Please contact support to get the official number.
                        </div>
                      )}

                      {qrCode && (
                        <div className="flex flex-col items-center gap-1.5 pt-2 border-t border-primary/10">
                          <p className="text-[10px] font-bold uppercase opacity-60">Scan QR Code to Pay</p>
                          <div className="p-2 bg-white rounded-xl shadow-xs border border-primary/15">
                            <Image src={qrCode} alt={`${methodName} QR`} width={128} height={128} className="h-28 w-28 object-contain" />
                          </div>
                        </div>
                      )}

                      {settings?.manualPaymentConfig?.instructions && (
                        <p className="text-xs leading-relaxed text-muted-foreground pt-1 border-t border-primary/10">
                          {settings.manualPaymentConfig.instructions}
                        </p>
                      )}
                    </div>
                  );
                })()}

                <div className="space-y-2">
                  <Label>Amount (BDT)</Label>
                  <Input 
                    type="number" 
                    placeholder="Enter BDT amount" 
                    value={depositAmount} 
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="h-11 rounded-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Sender Mobile Number</Label>
                  <Input 
                    type="text" 
                    placeholder="017XXXXXXXX" 
                    value={depositSender} 
                    onChange={(e) => setDepositSender(e.target.value)}
                    className="h-11 rounded-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Transaction ID (TxID)</Label>
                  <Input 
                    type="text" 
                    placeholder="Enter transaction TxID" 
                    value={depositTxId} 
                    onChange={(e) => setDepositTxId(e.target.value)}
                    className="h-11 rounded-lg"
                  />
                </div>

                <Button type="submit" disabled={submitting} className="w-full h-11 font-bold rounded-lg mt-2">
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Submit Deposit Notification
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Withdrawal Form */}
        <TabsContent value="withdraw">
          <Card className="max-w-xl">
            <CardHeader>
              <CardTitle>Withdrawal Request</CardTitle>
              <CardDescription>Request cashout to your MFS number from Withdrawal Wallet.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleWithdraw} className="space-y-4">
                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <Select value={withdrawMethod} onValueChange={(val) => setWithdrawMethod(val || '')}>
                    <SelectTrigger className="h-11 rounded-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bkash">bKash</SelectItem>
                      <SelectItem value="nagad">Nagad</SelectItem>
                      <SelectItem value="rocket">Rocket</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Withdraw Amount (BDT)</Label>
                  <Input 
                    type="number" 
                    placeholder="Enter cashout amount" 
                    value={withdrawAmount} 
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="h-11 rounded-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Target Mobile Number</Label>
                  <Input 
                    type="text" 
                    placeholder="017XXXXXXXX" 
                    value={withdrawAccount} 
                    onChange={(e) => setWithdrawAccount(e.target.value)}
                    className="h-11 rounded-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Secure Transaction PIN</Label>
                  <Input 
                    type="password" 
                    placeholder="Enter transaction PIN" 
                    value={withdrawPin} 
                    onChange={(e) => setWithdrawPin(e.target.value)}
                    maxLength={6}
                    className="h-11 rounded-lg"
                  />
                </div>

                <Button type="submit" disabled={submitting} className="w-full h-11 font-bold rounded-lg mt-2">
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Submit Withdrawal Request
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Convert Form: Bonus → Withdrawal */}
        <TabsContent value="convert">
          <Card className="max-w-xl border-blue-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5 text-blue-600" />
                Bonus → Withdrawal Convert
              </CardTitle>
              <CardDescription>
                Bonus Wallet থেকে Withdrawal Wallet এ টাকা নিন, তারপর bKash/Nagad/Bank এ cashout করুন।
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Balance preview */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-center">
                  <p className="text-xs font-bold uppercase tracking-wide text-blue-600 mb-1">Bonus Wallet</p>
                  <p className="text-2xl font-black text-blue-900">৳{(data?.balances?.bonusWallet || 0).toLocaleString()}</p>
                  <p className="text-[10px] text-blue-500 mt-1">Available to convert</p>
                </div>
                <div className="rounded-xl border border-purple-200 bg-purple-50 p-4 text-center">
                  <p className="text-xs font-bold uppercase tracking-wide text-purple-600 mb-1">Withdrawal Wallet</p>
                  <p className="text-2xl font-black text-purple-900">৳{(data?.balances?.withdrawalWallet || 0).toLocaleString()}</p>
                  <p className="text-[10px] text-purple-500 mt-1">After convert, withdraw here</p>
                </div>
              </div>

              {/* Arrow indicator */}
              <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
                <span className="font-semibold text-blue-600">Bonus Wallet</span>
                <RefreshCw className="h-4 w-4 text-muted-foreground animate-spin" style={{ animationDuration: '3s' }} />
                <span className="font-semibold text-purple-600">Withdrawal Wallet</span>
              </div>

              <form onSubmit={handleConvert} className="space-y-4">
                <div className="space-y-2">
                  <Label>Convert Amount (BDT)</Label>
                  <div className="relative">
                    <Input
                      type="number"
                      placeholder="Enter amount to convert"
                      value={convertAmount}
                      onChange={(e) => setConvertAmount(e.target.value)}
                      className="h-11 rounded-lg pr-20"
                      min={1}
                      max={data?.balances?.bonusWallet || 0}
                    />
                    <button
                      type="button"
                      onClick={() => setConvertAmount(String(data?.balances?.bonusWallet || 0))}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-md transition-colors"
                    >
                      Max
                    </button>
                  </div>
                  {convertAmount && Number(convertAmount) > 0 && (
                    <p className="text-xs text-muted-foreground">
                      After convert: Bonus ৳{Math.max(0, (data?.balances?.bonusWallet || 0) - Number(convertAmount)).toLocaleString()} → Withdrawal ৳{((data?.balances?.withdrawalWallet || 0) + Number(convertAmount)).toLocaleString()}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Secure Transaction PIN</Label>
                  <Input
                    type="password"
                    placeholder="Enter transaction PIN"
                    value={convertPin}
                    onChange={(e) => setConvertPin(e.target.value)}
                    maxLength={6}
                    className="h-11 rounded-lg"
                  />
                  <p className="text-xs text-muted-foreground">PIN সেট না থাকলে আগে &quot;Secure PIN&quot; tab থেকে set করুন।</p>
                </div>

                <Button
                  type="submit"
                  disabled={submitting || !convertAmount || Number(convertAmount) <= 0}
                  className="w-full h-11 font-bold rounded-lg mt-2 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {submitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="mr-2 h-4 w-4" />
                  )}
                  Convert to Withdrawal Wallet
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transfer Form */}
        <TabsContent value="transfer">
          <Card className="max-w-xl">
            <CardHeader>
              <CardTitle>Secure Wallet-to-Wallet Transfer</CardTitle>
              <CardDescription>Transfer tokens to another member's Deposit Wallet instantly.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleTransfer} className="space-y-4">
                <div className="space-y-2">
                  <Label>Source Wallet</Label>
                  <Select value={transferSource} onValueChange={(val) => setTransferSource(val || '')}>
                    <SelectTrigger className="h-11 rounded-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="depositWallet">Deposit Wallet</SelectItem>
                      <SelectItem value="bonusWallet">Bonus Wallet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Recipient Member ID</Label>
                  <Input 
                    type="text" 
                    placeholder="ABS-XXXXXX" 
                    value={transferTarget} 
                    onChange={(e) => setTransferTarget(e.target.value)}
                    className="h-11 rounded-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Amount (BDT)</Label>
                  <Input 
                    type="number" 
                    placeholder="Enter BDT amount" 
                    value={transferAmount} 
                    onChange={(e) => setTransferAmount(e.target.value)}
                    className="h-11 rounded-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Secure Transaction PIN</Label>
                  <Input 
                    type="password" 
                    placeholder="Enter transaction PIN" 
                    value={transferPin} 
                    onChange={(e) => setTransferPin(e.target.value)}
                    className="h-11 rounded-lg"
                  />
                </div>

                <Button type="submit" disabled={submitting} className="w-full h-11 font-bold rounded-lg mt-2">
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Execute Transfer
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security PIN Change */}
        <TabsContent value="pin">
          <Card className="max-w-xl">
            <CardHeader>
              <CardTitle>Manage Secure Transaction PIN</CardTitle>
              <CardDescription>Setup or update your 4-6 digit numeric PIN to authorize transfers & cashouts.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdatePin} className="space-y-4">
                <div className="space-y-2">
                  <Label>Old Transaction PIN (Leave blank if setting first time)</Label>
                  <Input 
                    type="password" 
                    placeholder="Current PIN" 
                    value={pinOld} 
                    onChange={(e) => setPinOld(e.target.value)}
                    className="h-11 rounded-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label>New Transaction PIN</Label>
                  <Input 
                    type="password" 
                    placeholder="Enter new PIN" 
                    value={pinNew} 
                    onChange={(e) => setPinNew(e.target.value)}
                    maxLength={6}
                    className="h-11 rounded-lg"
                  />
                </div>

                <Button type="submit" disabled={submitting} className="w-full h-11 font-bold rounded-lg mt-2">
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Set New PIN
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
