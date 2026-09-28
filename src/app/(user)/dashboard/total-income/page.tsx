'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  TrendingUp,
  Coins,
  Award,
  Wallet,
  Loader2,
  Calendar,
  CheckCircle2,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';

export default function TotalIncomePage() {
  const { data: session } = useSession();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFunds() {
      try {
        const res = await fetch('/api/user/funds');
        if (res.ok) setData(await res.json());
      } catch (err) {
        toast.error('Failed to load income details');
      } finally {
        setLoading(false);
      }
    }
    if (session?.user) loadFunds();
  }, [session]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-xs text-muted-foreground font-semibold">Loading Total Income...</p>
        </div>
      </div>
    );
  }

  const summary = data?.summary || {};
  const history = data?.recentBonusHistory || [];

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="rounded-2xl bg-linear-to-r from-emerald-600 via-primary to-teal-700 p-6 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black">Total Income</h1>
            <p className="text-xs sm:text-sm opacity-90 mt-1 max-w-xl">
              Lifetime aggregated income generated from direct sponsor bonuses, 10-generation matrix commissions, and rank advancement rewards.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl text-right shrink-0 border border-white/15">
            <span className="text-xs uppercase tracking-wider block opacity-80">Lifetime Total Income</span>
            <span className="text-3xl font-black">৳{(summary.totalIncome || 0).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Income Streams */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border">
          <CardHeader className="pb-1">
            <span className="text-[10px] uppercase font-bold text-muted-foreground">Sponsor Earnings</span>
            <CardTitle className="text-2xl font-black text-primary mt-1">৳{(summary.sponsorBonus || 0).toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent><p className="text-xs text-muted-foreground">Direct 15% commissions</p></CardContent>
        </Card>

        <Card className="border">
          <CardHeader className="pb-1">
            <span className="text-[10px] uppercase font-bold text-muted-foreground">Generation Earnings</span>
            <CardTitle className="text-2xl font-black text-blue-600 mt-1">৳{(summary.generationBonus || 0).toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent><p className="text-xs text-muted-foreground">1-10 levels team split</p></CardContent>
        </Card>

        <Card className="border">
          <CardHeader className="pb-1">
            <span className="text-[10px] uppercase font-bold text-muted-foreground">Auto Profit Matrix</span>
            <CardTitle className="text-2xl font-black text-emerald-600 mt-1">৳{(summary.autoProfitBonus || 0).toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent><p className="text-xs text-muted-foreground">System tier pool payouts</p></CardContent>
        </Card>

        <Card className="border">
          <CardHeader className="pb-1">
            <span className="text-[10px] uppercase font-bold text-muted-foreground">Rank Promotion Bonuses</span>
            <CardTitle className="text-2xl font-black text-amber-600 mt-1">৳{(summary.rankBonus || 0).toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent><p className="text-xs text-muted-foreground">Leadership cash rewards</p></CardContent>
        </Card>
      </div>

      {/* Complete Income Ledger */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold">Income Transaction Statement</CardTitle>
          <CardDescription>Real-time records of all earnings deposited to your account</CardDescription>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">No income transactions found yet.</div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Date</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((tx: any) => (
                    <TableRow key={tx._id}>
                      <TableCell className="text-xs font-mono">{new Date(tx.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize text-emerald-600 border-emerald-500/30 bg-emerald-500/5">
                          {tx.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">{tx.description}</TableCell>
                      <TableCell className="text-right font-mono font-bold text-emerald-600">+৳{(tx.amount || 0).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
