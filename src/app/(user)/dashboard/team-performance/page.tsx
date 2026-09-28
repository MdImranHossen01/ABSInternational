'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  Users,
  TrendingUp,
  Package,
  Award,
  CheckCircle2,
  Clock,
  Loader2,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

export default function TeamPerformancePage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<any>(null);
  const [network, setNetwork] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [pRes, nRes] = await Promise.all([
          fetch('/api/user/profile'),
          fetch('/api/user/network?status=all'),
        ]);
        if (pRes.ok) setProfile(await pRes.json());
        if (nRes.ok) setNetwork(await nRes.json());
      } catch (err) {
        toast.error('Failed to load performance metrics');
      } finally {
        setLoading(false);
      }
    }
    if (session?.user) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [session]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-xs text-muted-foreground font-semibold">Loading Team Performance...</p>
        </div>
      </div>
    );
  }

  const directTeam = network?.directTeam || [];
  const activeDirects = directTeam.filter((m: any) => m.isSubscriptionActive).length;
  const inactiveDirects = directTeam.length - activeDirects;
  const totalTeam = profile?.teamCount || 0;

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="rounded-2xl bg-linear-to-r from-emerald-600 via-teal-700 to-primary p-6 text-white shadow-lg">
        <h1 className="text-2xl sm:text-3xl font-black">Team Performance</h1>
        <p className="text-xs sm:text-sm opacity-90 mt-1 max-w-2xl">
          Comprehensive real-time analytics for your direct network volume, active member ratios, personal sales, and group business volume.
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-primary/20 bg-linear-to-b from-primary/5 to-transparent">
          <CardHeader className="pb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total Network Size</span>
            <CardTitle className="text-3xl font-black mt-1">{totalTeam} Members</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Across all 10 generations</p>
          </CardContent>
        </Card>

        <Card className="border border-emerald-500/20 bg-linear-to-b from-emerald-500/5 to-transparent">
          <CardHeader className="pb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Direct Referrals</span>
            <CardTitle className="text-3xl font-black mt-1 text-emerald-800 dark:text-emerald-300">{directTeam.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-emerald-600 font-semibold">{activeDirects} Active · {inactiveDirects} Inactive</p>
          </CardContent>
        </Card>

        <Card className="border border-blue-500/20 bg-linear-to-b from-blue-500/5 to-transparent">
          <CardHeader className="pb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">Personal Sales</span>
            <CardTitle className="text-3xl font-black mt-1 text-blue-900 dark:text-blue-300">৳{profile?.personalSales || 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Personal product purchases</p>
          </CardContent>
        </Card>

        <Card className="border border-purple-500/20 bg-linear-to-b from-purple-500/5 to-transparent">
          <CardHeader className="pb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400">Total Group Volume</span>
            <CardTitle className="text-3xl font-black mt-1 text-purple-900 dark:text-purple-300">৳{profile?.teamSales || 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Combined downline package sales</p>
          </CardContent>
        </Card>
      </div>

      {/* Generation Breakdown Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" /> 10-Generation Team Distribution
          </CardTitle>
          <CardDescription>Member count breakdown across each generational depth tier</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {(network?.generations || []).map((gen: any) => {
              const activeCount = gen.members?.filter((m: any) => m.isSubscriptionActive).length || 0;
              const totalCount = gen.members?.length || 0;

              return (
                <div key={gen.level} className="p-3 rounded-xl border bg-muted/20 text-center space-y-1">
                  <Badge variant="outline" className="text-[10px] font-mono">Gen {gen.level}</Badge>
                  <div className="text-xl font-black text-foreground">{totalCount}</div>
                  <div className="text-[10px] text-emerald-600 font-semibold">{activeCount} Active</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
