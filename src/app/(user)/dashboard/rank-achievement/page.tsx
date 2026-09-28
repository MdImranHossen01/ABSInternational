'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  Award,
  Trophy,
  CheckCircle2,
  Clock,
  Loader2,
  Calendar,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function RankAchievementPage() {
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
          toast.error('Failed to load achievement milestones');
        }
      } catch (err) {
        toast.error('Failed to load achievement milestones');
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
          <p className="text-xs text-muted-foreground font-semibold">Loading Achievements...</p>
        </div>
      </div>
    );
  }

  const currentRank = data?.currentRank || 'user';
  const ranksMaster = data?.ranksMaster || [];
  const currentIdx = ranksMaster.findIndex((r: any) => r.id === currentRank);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="rounded-2xl bg-linear-to-r from-purple-700 via-indigo-700 to-primary p-6 text-white shadow-lg">
        <h1 className="text-2xl sm:text-3xl font-black">Rank Achievement</h1>
        <p className="text-xs sm:text-sm opacity-90 mt-1 max-w-2xl">
          Detailed chronicle of all leadership milestone achievements and unlocked rewards throughout your ABS International career.
        </p>
      </div>

      <div className="space-y-4">
        {ranksMaster.map((r: any, idx: number) => {
          const isPassed = currentIdx >= idx;
          const isCurrent = currentRank === r.id;

          return (
            <Card
              key={r.id}
              className={`border transition-all ${
                isCurrent
                  ? 'border-primary ring-2 ring-primary/20 bg-primary/[0.02]'
                  : isPassed
                  ? 'border-emerald-500/30 bg-emerald-500/[0.01]'
                  : 'opacity-70'
              }`}
            >
              <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start sm:items-center gap-3.5">
                  <div
                    className={`size-11 rounded-xl flex items-center justify-center shrink-0 ${
                      isCurrent
                        ? 'bg-primary text-white shadow-md'
                        : isPassed
                        ? 'bg-emerald-500/10 text-emerald-600'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    <Trophy className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base text-foreground">{r.title}</h3>
                      {isCurrent ? (
                        <Badge className="bg-primary text-white font-bold text-[10px]">Active Rank</Badge>
                      ) : isPassed ? (
                        <Badge variant="outline" className="text-emerald-600 border-emerald-500 text-[10px]">Achieved</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[10px]">Locked</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{r.requirement}</p>
                    <div className="text-[11px] font-semibold text-primary mt-1">
                      Reward: {r.reward} {r.bonus > 0 && `(+৳${r.bonus.toLocaleString()} cash)`}
                    </div>
                  </div>
                </div>

                <div className="sm:text-right shrink-0">
                  {isPassed ? (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold">
                      <CheckCircle2 className="h-4 w-4" /> Milestone Verified
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold">
                      <Clock className="h-4 w-4" /> In Progress
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
