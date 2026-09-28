'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  Sparkles,
  Award,
  TrendingUp,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function RankDevelopmentFundPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFunds() {
      try {
        const res = await fetch('/api/user/funds');
        if (res.ok) setData(await res.json());
      } catch (err) {
        toast.error('Failed to load fund info');
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
          <p className="text-xs text-muted-foreground font-semibold">Loading Rank Development Fund...</p>
        </div>
      </div>
    );
  }

  const pool = data?.globalFunds?.rankDevelopmentFund || 0;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-linear-to-r from-cyan-600 via-teal-700 to-primary p-6 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black">Rank Development Fund</h1>
            <p className="text-xs sm:text-sm opacity-90 mt-1 max-w-xl">
              2.5% (৳37.5 BDT) per activation dedicated strictly to financing leadership support and instant cash rewards upon achieving new manager and leadership ranks.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl text-right shrink-0 border border-white/15">
            <span className="text-xs uppercase tracking-wider block opacity-80">Development Fund Balance</span>
            <span className="text-3xl font-black">৳{pool.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <Card className="border">
          <CardHeader className="pb-1">
            <span className="text-[10px] uppercase font-bold text-muted-foreground">Team Manager</span>
            <CardTitle className="text-xl font-bold mt-1 text-emerald-600">+৳200 Cash</CardTitle>
          </CardHeader>
          <CardContent><p className="text-xs text-muted-foreground">Paid from this fund upon 6 active direct downlines</p></CardContent>
        </Card>

        <Card className="border">
          <CardHeader className="pb-1">
            <span className="text-[10px] uppercase font-bold text-muted-foreground">Royal Manager</span>
            <CardTitle className="text-xl font-bold mt-1 text-indigo-600">+৳1,000 Cash</CardTitle>
          </CardHeader>
          <CardContent><p className="text-xs text-muted-foreground">Paid from this fund upon 6 Team Managers</p></CardContent>
        </Card>

        <Card className="border">
          <CardHeader className="pb-1">
            <span className="text-[10px] uppercase font-bold text-muted-foreground">Silver Manager</span>
            <CardTitle className="text-xl font-bold mt-1 text-cyan-600">+৳6,000 Cash</CardTitle>
          </CardHeader>
          <CardContent><p className="text-xs text-muted-foreground">Paid from this fund upon 6 Royal Managers</p></CardContent>
        </Card>
      </div>
    </div>
  );
}
