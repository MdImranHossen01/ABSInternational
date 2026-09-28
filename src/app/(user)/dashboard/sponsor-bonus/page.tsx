'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  Coins,
  Users,
  CheckCircle2,
  Loader2,
  Calendar,
  ArrowUpRight,
  TrendingUp
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

export default function SponsorBonusPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFunds() {
      try {
        const res = await fetch('/api/user/funds');
        if (res.ok) setData(await res.json());
      } catch (err) {
        toast.error('Failed to load sponsor bonus');
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
          <p className="text-xs text-muted-foreground font-semibold">Loading Sponsor Bonus...</p>
        </div>
      </div>
    );
  }

  const sponsorTotal = data?.summary?.sponsorBonus || 0;
  const history = (data?.recentBonusHistory || []).filter((tx: any) =>
    (tx.description || '').toLowerCase().includes('sponsor')
  );

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="rounded-2xl bg-linear-to-r from-emerald-600 via-teal-700 to-primary p-6 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black">Sponsor Bonus</h1>
            <p className="text-xs sm:text-sm opacity-90 mt-1 max-w-xl">
              Earn an immediate 15% (৳225 BDT) direct cash commission on every new member who joins ABS International with your Sponsor Member ID.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl text-right shrink-0 border border-white/15">
            <span className="text-xs uppercase tracking-wider block opacity-80">Total Sponsor Bonus</span>
            <span className="text-3xl font-black">৳{sponsorTotal.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border">
          <CardHeader className="pb-1">
            <span className="text-[10px] uppercase font-bold text-muted-foreground">Commission Rate</span>
            <CardTitle className="text-2xl font-black text-primary mt-1">15%</CardTitle>
          </CardHeader>
          <CardContent><p className="text-xs text-muted-foreground">Of ৳1,500 Joining Package</p></CardContent>
        </Card>

        <Card className="border">
          <CardHeader className="pb-1">
            <span className="text-[10px] uppercase font-bold text-muted-foreground">Per Activation Payout</span>
            <CardTitle className="text-2xl font-black text-emerald-600 mt-1">৳225 BDT</CardTitle>
          </CardHeader>
          <CardContent><p className="text-xs text-muted-foreground">Credited instantly to Bonus Wallet</p></CardContent>
        </Card>

        <Card className="border">
          <CardHeader className="pb-1">
            <span className="text-[10px] uppercase font-bold text-muted-foreground">Limits & Caps</span>
            <CardTitle className="text-2xl font-black text-foreground mt-1">Unlimited</CardTitle>
          </CardHeader>
          <CardContent><p className="text-xs text-muted-foreground">Refer as many members as you wish</p></CardContent>
        </Card>
      </div>

      {/* History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold">Direct Sponsor Bonus History</CardTitle>
          <CardDescription>Statement of direct referrals and credited commissions</CardDescription>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No sponsor bonuses recorded yet. Share your referral sponsor link to start earning ৳225 per joining!
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Bonus Credited</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((tx: any) => (
                    <TableRow key={tx._id}>
                      <TableCell className="text-xs font-mono">{new Date(tx.createdAt).toLocaleDateString()}</TableCell>
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
