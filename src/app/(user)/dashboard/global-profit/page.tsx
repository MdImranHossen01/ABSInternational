'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  Globe,
  Coins,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  Calendar,
  Users
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function GlobalProfitPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFunds() {
      try {
        const res = await fetch('/api/user/funds');
        if (res.ok) setData(await res.json());
      } catch (err) {
        toast.error('Failed to load global profit');
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
          <p className="text-xs text-muted-foreground font-semibold">Loading Global Profit...</p>
        </div>
      </div>
    );
  }

  const pool = data?.globalFunds?.globalProfit || 0;
  const userEarned = data?.summary?.globalProfitBonus || 0;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-linear-to-r from-purple-700 via-indigo-700 to-primary p-6 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black">Global Profit Fund</h1>
            <p className="text-xs sm:text-sm opacity-90 mt-1 max-w-xl">
              2% (৳30 BDT) of every membership package activation across the entire company is reserved in this dedicated fund and distributed equally to all active members.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl text-right shrink-0 border border-white/15">
            <span className="text-xs uppercase tracking-wider block opacity-80">Live Company Pool</span>
            <span className="text-3xl font-black">৳{pool.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border">
          <CardHeader className="pb-1">
            <span className="text-[10px] uppercase font-bold text-muted-foreground">Allocation Percentage</span>
            <CardTitle className="text-2xl font-black text-purple-700 mt-1">2.0%</CardTitle>
          </CardHeader>
          <CardContent><p className="text-xs text-muted-foreground">৳30 BDT on every ৳1,500 package</p></CardContent>
        </Card>

        <Card className="border">
          <CardHeader className="pb-1">
            <span className="text-[10px] uppercase font-bold text-muted-foreground">Distribution Mechanism</span>
            <CardTitle className="text-2xl font-black text-foreground mt-1">Equal Share</CardTitle>
          </CardHeader>
          <CardContent><p className="text-xs text-muted-foreground">Evenly split among all active accounts</p></CardContent>
        </Card>

        <Card className="border">
          <CardHeader className="pb-1">
            <span className="text-[10px] uppercase font-bold text-muted-foreground">My Received Share</span>
            <CardTitle className="text-2xl font-black text-emerald-600 mt-1">৳{userEarned.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent><p className="text-xs text-muted-foreground">Directly credited to Bonus Wallet</p></CardContent>
        </Card>
      </div>
    </div>
  );
}
