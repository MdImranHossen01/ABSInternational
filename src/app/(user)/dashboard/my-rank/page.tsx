'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  Trophy,
  Award,
  Crown,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Loader2,
  Gift
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

export default function MyRankPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRank() {
      try {
        const res = await fetch('/api/user/ranks');
        if (res.ok) {
          setData(await res.json());
        } else {
          toast.error('Failed to load rank info');
        }
      } catch (err) {
        toast.error('Failed to load rank info');
      } finally {
        setLoading(false);
      }
    }
    if (session?.user) loadRank();
  }, [session]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-xs text-muted-foreground font-semibold">Loading My Rank...</p>
        </div>
      </div>
    );
  }

  const currentRank = data?.currentRank || 'user';
  const nextRank = data?.nextRank;

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="rounded-2xl bg-linear-to-r from-amber-600 via-orange-600 to-primary p-6 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black">My Rank</h1>
            <p className="text-xs sm:text-sm opacity-90 mt-1 max-w-xl">
              Your official leadership rank in ABS International. Advance tiers by qualifying direct leaders in your network.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl text-center sm:text-right shrink-0 border border-white/15">
            <span className="text-xs uppercase tracking-wider block opacity-80">Official Rank</span>
            <div className="flex items-center justify-center sm:justify-end gap-2 mt-1">
              <Trophy className="h-6 w-6 text-amber-300" />
              <span className="text-2xl font-black">{currentRank}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Current Rank Status & Privileges */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-600" /> Current Rank Privileges
            </CardTitle>
            <CardDescription>Benefits active on your account right now</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-muted/40 rounded-xl space-y-2 text-xs">
              <div className="flex items-center gap-2 font-bold text-foreground">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Full E-Store Access & Member Pricing
              </div>
              <div className="flex items-center gap-2 font-bold text-foreground">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" /> 10-Generation MLM Distribution Eligibility
              </div>
              <div className="flex items-center gap-2 font-bold text-foreground">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Direct Sponsor Bonus Earnings (৳225/referral)
              </div>
              <div className="flex items-center gap-2 font-bold text-foreground">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Auto-Profit Matrix Tier Participation
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" /> Next Rank Milestone
            </CardTitle>
            <CardDescription>Qualify for {nextRank?.title || 'Highest Tier'}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span>{data?.progressLabel}</span>
                <span className="text-primary font-bold">{data?.progressPercentage}%</span>
              </div>
              <Progress value={data?.progressPercentage || 0} className="h-3" />
            </div>

            {nextRank && (
              <div className="p-3 bg-primary/5 border border-primary/20 rounded-xl space-y-1 text-xs">
                <div className="font-bold text-primary flex items-center gap-1.5">
                  <Gift className="h-4 w-4" /> Unlocks upon promotion:
                </div>
                <p className="text-muted-foreground">{nextRank.reward}</p>
                <p className="font-mono font-bold text-emerald-600 pt-1">+৳{(nextRank.bonus || 0).toLocaleString()} Instant Cash Bonus</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
