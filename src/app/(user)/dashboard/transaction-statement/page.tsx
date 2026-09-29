'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  History,
  ArrowUpRight,
  ArrowDownLeft,
  Search,
  Loader2,
  Calendar
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';

export default function TransactionStatementPage() {
  const { data: session } = useSession();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLedger() {
      try {
        const res = await fetch('/api/user/wallet');
        if (res.ok) {
          const data = await res.json();
          setTransactions(data.transactions || []);
        }
      } catch (err) {
        toast.error('Failed to load transaction statement');
      } finally {
        setLoading(false);
      }
    }
    if (session?.user) {
      loadLedger();
    } else {
      setLoading(false);
    }
  }, [session]);

  const filtered = transactions.filter((tx: any) => {
    const term = searchTerm.toLowerCase();
    const descMatch = (tx.description || '').toLowerCase().includes(term);
    const typeMatch = (tx.type || '').toLowerCase().includes(term);
    return descMatch || typeMatch;
  });

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-xs text-muted-foreground font-semibold">Loading Transaction Statement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-linear-to-r from-slate-900 via-indigo-950 to-primary p-6 text-white shadow-lg">
        <h1 className="text-2xl sm:text-3xl font-black">Transaction Statement</h1>
        <p className="text-xs sm:text-sm opacity-90 mt-1 max-w-xl">
          Complete, tamper-proof audit trail of all deposits, withdrawals, internal transfers, and bonus ledger entries.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <History className="h-5 w-5 text-primary" /> Unified Ledger Statement
            </CardTitle>
            <CardDescription>Real-time transaction chronological history</CardDescription>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search description or type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">No transactions matching your search.</div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((tx: any) => {
                      const isCredit = ['deposit', 'earned', 'received'].includes(tx.type);

                      return (
                        <TableRow key={tx._id}>
                          <TableCell className="text-xs font-mono">
                            {new Date(tx.createdAt).toLocaleDateString()} {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize text-[10px]">{tx.type}</Badge>
                          </TableCell>
                          <TableCell className="text-xs">{tx.description}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`capitalize text-[10px] ${
                                (tx.status || 'completed') === 'completed'
                                  ? 'text-emerald-600 border-emerald-500 bg-emerald-500/5'
                                  : tx.status === 'rejected'
                                  ? 'text-rose-600 border-rose-500 bg-rose-500/5'
                                  : 'text-amber-600 border-amber-500 bg-amber-500/5'
                              }`}
                            >
                              {tx.status || 'completed'}
                            </Badge>
                          </TableCell>
                          <TableCell className={`text-right font-mono font-bold text-xs ${isCredit ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {isCredit ? '+' : '-'}৳{(tx.amount || 0).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards View */}
              <div className="md:hidden divide-y divide-border rounded-xl border overflow-hidden">
                {filtered.map((tx: any) => {
                  const isCredit = ['deposit', 'earned', 'received'].includes(tx.type);
                  return (
                    <div key={tx._id} className="p-3 bg-card space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <Badge variant="outline" className="capitalize text-[10px] px-2 py-0.5">
                            {tx.type}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={`capitalize text-[10px] px-2 py-0.5 ${
                              (tx.status || 'completed') === 'completed'
                                ? 'text-emerald-600 border-emerald-500 bg-emerald-500/5'
                                : tx.status === 'rejected'
                                ? 'text-rose-600 border-rose-500 bg-rose-500/5'
                                : 'text-amber-600 border-amber-500 bg-amber-500/5'
                            }`}
                          >
                            {tx.status || 'completed'}
                          </Badge>
                        </div>
                        <span className={`font-mono font-bold text-sm ${isCredit ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {isCredit ? '+' : '-'}৳{(tx.amount || 0).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-foreground/90 font-medium leading-snug">{tx.description}</p>
                      <div className="text-[11px] text-muted-foreground font-mono">
                        {new Date(tx.createdAt).toLocaleDateString()} {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
