'use client';

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
    CheckCircle2
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border border-emerald-500/10 bg-emerald-500/[0.02]">
          <CardContent className="pt-6 flex justify-between items-center">
            <div>
              <p className="text-xs uppercase text-emerald-800 tracking-wider font-bold">Deposit Wallet</p>
              <div className="text-3xl font-black text-emerald-950 mt-1">৳{data?.balances?.depositWallet || 0}</div>
            </div>
            <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-600"><Wallet className="h-6 w-6" /></div>
          </CardContent>
        </Card>
        <Card className="border border-blue-500/10 bg-blue-500/[0.02]">
          <CardContent className="pt-6 flex justify-between items-center">
            <div>
              <p className="text-xs uppercase text-blue-800 tracking-wider font-bold">Bonus Wallet</p>
              <div className="text-3xl font-black text-blue-950 mt-1">৳{data?.balances?.bonusWallet || 0}</div>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-600"><History className="h-6 w-6" /></div>
          </CardContent>
        </Card>
        <Card className="border border-purple-500/10 bg-purple-500/[0.02]">
          <CardContent className="pt-6 flex justify-between items-center">
            <div>
              <p className="text-xs uppercase text-purple-800 tracking-wider font-bold">Withdrawal Wallet</p>
              <div className="text-3xl font-black text-purple-950 mt-1">৳{data?.balances?.withdrawalWallet || 0}</div>
            </div>
            <div className="p-3 bg-purple-500/10 rounded-xl text-purple-600"><ArrowDownCircle className="h-6 w-6" /></div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="statement" className="w-full space-y-6">
        <TabsList className="grid grid-cols-5 bg-muted rounded-xl p-1 w-full max-w-2xl overflow-x-auto">
          <TabsTrigger value="statement" className="rounded-lg gap-1.5"><History className="h-4 w-4" /> Statement</TabsTrigger>
          <TabsTrigger value="deposit" className="rounded-lg gap-1.5"><ArrowUpCircle className="h-4 w-4" /> Deposit</TabsTrigger>
          <TabsTrigger value="withdraw" className="rounded-lg gap-1.5"><ArrowDownCircle className="h-4 w-4" /> Withdraw</TabsTrigger>
          <TabsTrigger value="transfer" className="rounded-lg gap-1.5"><Send className="h-4 w-4" /> Transfer</TabsTrigger>
          <TabsTrigger value="pin" className="rounded-lg gap-1.5"><Key className="h-4 w-4" /> Secure PIN</TabsTrigger>
        </TabsList>

        {/* Ledger Statement */}
        <TabsContent value="statement">
          <Card>
            <CardHeader>
              <CardTitle>Unified Transaction Ledger</CardTitle>
              <CardDescription>Track all deposits, withdrawals, transfers, and bonus statements.</CardDescription>
            </CardHeader>
            <CardContent>
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
