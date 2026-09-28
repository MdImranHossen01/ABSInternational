'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  Camera,
  Trophy,
  Award,
  Crown,
  Sparkles,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function AchievementPhotoPage() {
  const { data: session, status } = useSession();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session?.user) {
      setLoading(false);
      return;
    }

    async function loadData() {
      try {
        const res = await fetch('/api/user/ranks');
        if (res.ok) {
          setData(await res.json());
        } else {
          toast.error('Failed to load achiever photos');
        }
      } catch (err) {
        toast.error('Failed to load achiever photos');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [status, session?.user]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-xs text-muted-foreground font-semibold">Loading Achievers Gallery...</p>
        </div>
      </div>
    );
  }

  const topAchievers = data?.topAchievers || [];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-linear-to-r from-amber-600 via-orange-600 to-primary p-6 text-white shadow-lg">
        <h1 className="text-2xl sm:text-3xl font-black">Achievement Photo (Hall of Fame)</h1>
        <p className="text-xs sm:text-sm opacity-90 mt-1 max-w-2xl">
          Celebrating top rank achievers and leaders in ABS International who have made milestones in health, beauty, and leadership.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {topAchievers.map((achiever: any, idx: number) => (
          <div key={idx} className="group rounded-2xl border bg-card overflow-hidden shadow-xs hover:shadow-md transition-all">
            <div className="h-48 bg-linear-to-b from-primary/20 via-muted to-muted flex items-center justify-center relative">
              <div className="size-20 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center text-primary font-black text-2xl">
                {achiever.name.charAt(0)}
              </div>
              <Badge className="absolute top-3 right-3 bg-amber-500 text-white font-bold text-[10px]">
                {achiever.rank}
              </Badge>
            </div>
            <div className="p-4 space-y-1.5">
              <h4 className="font-bold text-base text-foreground">{achiever.name}</h4>
              <p className="text-xs text-muted-foreground">{achiever.city}, Bangladesh</p>
              <div className="pt-2 text-xs text-primary font-semibold border-t">
                Honored with: {achiever.reward}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
