'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  TrendingUp,
  Award,
  Trophy,
  CheckCircle2,
  Loader2,
  Gift,
  ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function RankProgressPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRanks() {
      try {
        const res = await fetch('/api/user/ranks');
        if (res.ok) {
          setData(await res.json());
        } else {
          toast.error('Failed to load rank progress');
        }
      } catch (err) {
        toast.error('Failed to load rank progress');
      } finally {
        setLoading(false);
      }
    }
    if (session?.user) loadRanks();
  }, [session]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-xs text-muted-foreground font-semibold">Loading Progress Meter...</p>
        </div>
      </div>
    );
  }

  const currentRank = data?.currentRank || 'user';
  const nextRank = data?.nextRank;
  const progress = data?.progressPercentage || 0;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="rounded-2xl bg-linear-to-r from-amber-600 via-orange-600 to-primary p-6 text-white shadow-lg">
        <h1 className="text-2xl sm:text-3xl font-black">Rank Progress</h1>
        <p className="text-xs sm:text-sm opacity-90 mt-1 max-w-xl">
          Real-time tracking of active downline leaders required to graduate to your next career tier.
        </p>
      </div>

      <Card className="border">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-amber-600" /> Career Milestone Meter
              </CardTitle>
              <CardDescription>{data?.progressLabel}</CardDescription>
            </div>
            {nextRank && (
              <Badge className="bg-primary text-white font-bold py-1 px-3 self-start sm:self-auto text-xs">
                Target: {nextRank.title}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-xs sm:text-sm font-bold">
              <span>Current: {currentRank}</span>
              <span className="text-primary">{progress}% Qualified</span>
            </div>
            <Progress value={progress} className="h-4 rounded-full" />
          </div>

          {nextRank && (
            <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl space-y-2 text-xs">
              <div className="font-bold text-amber-900 dark:text-amber-300 flex items-center gap-2 text-sm">
                <Gift className="h-4 w-4 text-amber-600" /> Promotion Reward for {nextRank.title}:
              </div>
              <p className="text-muted-foreground">{nextRank.reward}</p>
              <p className="font-mono font-bold text-emerald-600">+৳{(nextRank.bonus || 0).toLocaleString()} Instant Cash Bonus</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
