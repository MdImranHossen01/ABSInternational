'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  History,
  Gift,
  Award,
  Loader2,
  Calendar
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

export default function RewardHistoryPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/user/ranks');
        if (res.ok) {
          setData(await res.json());
        } else {
          toast.error('Failed to load reward history');
        }
      } catch (err) {
        toast.error('Failed to load reward history');
      } finally {
        setLoading(false);
      }
    }
    if (session?.user) loadData();
  }, [session]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-xs text-muted-foreground font-semibold">Loading Reward History...</p>
        </div>
      </div>
    );
  }

  const rewards = data?.rewardTransactions || [];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-linear-to-r from-amber-600 via-orange-600 to-primary p-6 text-white shadow-lg">
        <h1 className="text-2xl sm:text-3xl font-black">Reward History</h1>
        <p className="text-xs sm:text-sm opacity-90 mt-1 max-w-xl">
          Complete log of rank promotion cash bonuses, special incentives, and awards claimed on your account.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <History className="h-5 w-5 text-amber-600" /> Claimed Rewards & Cash Bonuses
          </CardTitle>
          <CardDescription>Verified rank disbursements and gift credentials</CardDescription>
        </CardHeader>
        <CardContent>
          {rewards.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No reward history found yet. Achieve 6 active direct downlines to earn your Team Manager reward!
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Date</TableHead>
                    <TableHead>Event & Reward Details</TableHead>
                    <TableHead className="text-right">Bonus Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rewards.map((tx: any) => (
                    <TableRow key={tx._id}>
                      <TableCell className="text-xs font-mono">{new Date(tx.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-xs font-semibold">{tx.description}</TableCell>
                      <TableCell className="text-right font-mono font-bold text-emerald-600">
                        +৳{(tx.amount || 0).toLocaleString()}
                      </TableCell>
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
