'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  History,
  ArrowUpCircle,
  Loader2,
  Calendar,
  CheckCircle2,
  Clock,
  Plus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';

export default function DepositHistoryPage() {
  const { data: session } = useSession();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await fetch('/api/user/wallet');
        if (res.ok) {
          const data = await res.json();
          const list = (data.transactions || []).filter((tx: any) =>
            tx.type === 'deposit' || (tx.description || '').toLowerCase().includes('deposit')
          );
          setTransactions(list);
        }
      } catch (err) {
        toast.error('Failed to load deposit history');
      } finally {
        setLoading(false);
      }
    }
    if (session?.user) loadHistory();
  }, [session]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-xs text-muted-foreground font-semibold">Loading Deposit History...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="rounded-2xl bg-linear-to-r from-emerald-600 via-teal-700 to-primary p-6 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black">Deposit History</h1>
            <p className="text-xs sm:text-sm opacity-90 mt-1 max-w-xl">
              Track the verification status and approval logs of all your bKash, Nagad, Rocket, and Bank deposit requests.
            </p>
          </div>
          <Link href="/dashboard/deposit">
            <Button className="bg-white text-emerald-800 hover:bg-white/90 font-bold shadow-md">
              <Plus className="mr-1.5 h-4 w-4" /> New Deposit
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <History className="h-5 w-5 text-primary" /> Deposit Logs & Statements
          </CardTitle>
          <CardDescription>Verified records of your Deposit Wallet funding</CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No deposit records found. Click "New Deposit" to fund your account.
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((tx: any) => (
                      <TableRow key={tx._id}>
                        <TableCell className="text-xs font-mono">{new Date(tx.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="text-xs">{tx.description}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`capitalize text-[10px] ${
                              tx.status === 'completed'
                                ? 'text-emerald-600 border-emerald-500 bg-emerald-500/5'
                                : tx.status === 'rejected'
                                ? 'text-rose-600 border-rose-500 bg-rose-500/5'
                                : 'text-amber-600 border-amber-500 bg-amber-500/5'
                            }`}
                          >
                            {tx.status || 'completed'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono font-bold text-emerald-600">
                          +৳{(tx.amount || 0).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards View */}
              <div className="md:hidden divide-y divide-border rounded-xl border overflow-hidden">
                {transactions.map((tx: any) => (
                  <div key={tx._id} className="p-3 bg-card space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <Badge
                        variant="outline"
                        className={`capitalize text-[10px] px-2 py-0.5 ${
                          tx.status === 'completed'
                            ? 'text-emerald-600 border-emerald-500 bg-emerald-500/5'
                            : tx.status === 'rejected'
                            ? 'text-rose-600 border-rose-500 bg-rose-500/5'
                            : 'text-amber-600 border-amber-500 bg-amber-500/5'
                        }`}
                      >
                        {tx.status || 'completed'}
                      </Badge>
                      <span className="font-mono font-bold text-emerald-600 text-sm">
                        +৳{(tx.amount || 0).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-foreground/90 font-medium leading-snug">{tx.description}</p>
                    <div className="text-[11px] text-muted-foreground font-mono">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </div>
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
