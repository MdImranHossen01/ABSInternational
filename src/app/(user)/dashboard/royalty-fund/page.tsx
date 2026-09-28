'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  Award,
  Crown,
  Gem,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function RoyaltyFundPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFunds() {
      try {
        const res = await fetch('/api/user/funds');
        if (res.ok) setData(await res.json());
      } catch (err) {
        toast.error('Failed to load royalty fund');
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
          <p className="text-xs text-muted-foreground font-semibold">Loading Royalty Fund...</p>
        </div>
      </div>
    );
  }

  const pool = data?.globalFunds?.royaltyFund || 0;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-linear-to-r from-indigo-800 via-purple-800 to-primary p-6 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black">Royalty Fund</h1>
            <p className="text-xs sm:text-sm opacity-90 mt-1 max-w-xl">
              2% (৳30 BDT) of every activation company-wide is reserved for Diamond Managers, Crown Managers, and Company Directors as lifetime executive royalty payouts.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl text-right shrink-0 border border-white/15">
            <span className="text-xs uppercase tracking-wider block opacity-80">Royalty Pool</span>
            <span className="text-3xl font-black">৳{pool.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border">
          <CardHeader className="pb-1">
            <Gem className="h-6 w-6 text-violet-600 mb-1" />
            <CardTitle className="text-base font-bold">Diamond Royalty</CardTitle>
          </CardHeader>
          <CardContent><p className="text-xs text-muted-foreground">Share of pool distributed quarterly to active Diamond Managers.</p></CardContent>
        </Card>

        <Card className="border">
          <CardHeader className="pb-1">
            <Crown className="h-6 w-6 text-rose-600 mb-1" />
            <CardTitle className="text-base font-bold">Crown Royalty</CardTitle>
          </CardHeader>
          <CardContent><p className="text-xs text-muted-foreground">Premium tier royalty share distributed to qualified Crown Managers.</p></CardContent>
        </Card>

        <Card className="border">
          <CardHeader className="pb-1">
            <Award className="h-6 w-6 text-amber-600 mb-1" />
            <CardTitle className="text-base font-bold">Director Equity</CardTitle>
          </CardHeader>
          <CardContent><p className="text-xs text-muted-foreground">Lifetime company profit equity for Company Directors.</p></CardContent>
        </Card>
      </div>
    </div>
  );
}
