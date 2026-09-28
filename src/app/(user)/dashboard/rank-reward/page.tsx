'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  Gift,
  Award,
  Crown,
  Trophy,
  Smartphone,
  Gem,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function RankRewardPage() {
  const { data: session, status } = useSession();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRanks() {
      try {
        const res = await fetch('/api/user/ranks');
        if (res.ok) {
          setData(await res.json());
        } else {
          toast.error('Failed to load rank rewards');
        }
      } catch (err) {
        toast.error('Failed to load rank rewards');
      } finally {
        setLoading(false);
      }
    }

    if (session?.user) {
      loadRanks();
    } else if (status === 'unauthenticated') {
      setLoading(false);
    }
  }, [session, status]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-xs text-muted-foreground font-semibold">Loading Rank Rewards...</p>
        </div>
      </div>
    );
  }

  const ranksMaster = data?.ranksMaster || [];
  const rewardsList = ranksMaster.filter((r: any) => r.bonus > 0);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-linear-to-r from-amber-600 via-orange-600 to-primary p-6 text-white shadow-lg">
        <h1 className="text-2xl sm:text-3xl font-black">Rank Rewards</h1>
        <p className="text-xs sm:text-sm opacity-90 mt-1 max-w-2xl">
          ABS International takes pride in honoring our leaders. Review the complete gifts, devices, vehicles, luxury tours, and real-estate rewards catalog.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rewardsList.map((item: any, idx: number) => (
          <Card key={item.id || idx} className="border hover:border-primary/50 transition-all flex flex-col justify-between">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-[10px]">Level {idx + 1}</Badge>
                <Gift className="h-5 w-5 text-amber-600" />
              </div>
              <CardTitle className="text-base font-bold mt-2">{item.title}</CardTitle>
              <CardDescription className="text-xs">{item.requirement}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2.5 pt-2">
              <div className="p-2.5 bg-muted/40 rounded-lg text-xs space-y-1">
                <div className="font-bold text-foreground">🎁 Reward Package:</div>
                <p className="text-muted-foreground">{item.reward}</p>
              </div>
              <div className="flex items-center justify-between text-xs pt-1 border-t">
                <span className="text-muted-foreground font-semibold">Cash Bonus:</span>
                <span className="font-mono font-bold text-emerald-600">
                  {item.bonus > 0 ? `৳${item.bonus.toLocaleString()} BDT` : '—'}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
