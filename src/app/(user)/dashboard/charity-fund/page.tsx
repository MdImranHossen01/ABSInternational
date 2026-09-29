'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  HeartHandshake,
  Heart,
  Smile,
  ShieldCheck,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function CharityFundPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFunds() {
      try {
        const res = await fetch('/api/user/funds');
        if (res.ok) setData(await res.json());
      } catch (err) {
        toast.error('Failed to load charity fund');
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
          <p className="text-xs text-muted-foreground font-semibold">Loading Charity Fund...</p>
        </div>
      </div>
    );
  }

  const pool = data?.globalFunds?.charityFund || 0;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-linear-to-r from-rose-600 via-pink-600 to-primary p-6 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black">Charity Fund</h1>
            <p className="text-xs sm:text-sm opacity-90 mt-1 max-w-xl">
              1% (৳15 BDT) from every membership activation is contributed to ABS International’s Corporate Social Responsibility (CSR) fund to help orphans, underprivileged medical patients, and destitute families.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl text-right shrink-0 border border-white/15">
            <span className="text-xs uppercase tracking-wider block opacity-80">Charity Reserve</span>
            <span className="text-3xl font-black">৳{pool.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border">
          <CardHeader className="pb-1">
            <HeartHandshake className="h-6 w-6 text-rose-600 mb-1" />
            <CardTitle className="text-base font-bold">Orphan Support</CardTitle>
          </CardHeader>
          <CardContent><p className="text-xs text-muted-foreground">Monthly educational supplies and nutrition for children without parents.</p></CardContent>
        </Card>

        <Card className="border">
          <CardHeader className="pb-1">
            <Heart className="h-6 w-6 text-rose-600 mb-1" />
            <CardTitle className="text-base font-bold">Emergency Medical Aid</CardTitle>
          </CardHeader>
          <CardContent><p className="text-xs text-muted-foreground">Direct financial and medical treatment relief for critically ill underprivileged individuals.</p></CardContent>
        </Card>

        <Card className="border">
          <CardHeader className="pb-1">
            <Smile className="h-6 w-6 text-rose-600 mb-1" />
            <CardTitle className="text-base font-bold">Disaster Relief</CardTitle>
          </CardHeader>
          <CardContent><p className="text-xs text-muted-foreground">Rapid response assistance during floods, seasonal crises, and winter warm clothes distribution.</p></CardContent>
        </Card>
      </div>
    </div>
  );
}
