'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  Gift,
  Award,
  Sparkles,
  Plane,
  Smartphone,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function IncentiveFundPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFunds() {
      try {
        const res = await fetch('/api/user/funds');
        if (res.ok) setData(await res.json());
      } catch (err) {
        toast.error('Failed to load incentive fund');
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
          <p className="text-xs text-muted-foreground font-semibold">Loading Incentive Fund...</p>
        </div>
      </div>
    );
  }

  const pool = data?.globalFunds?.incentiveFund || 0;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-linear-to-r from-amber-600 via-orange-600 to-primary p-6 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black">Incentive Fund</h1>
            <p className="text-xs sm:text-sm opacity-90 mt-1 max-w-xl">
              2% (৳30 BDT) per activation dedicated exclusively to funding member rewards such as 4G smartphones, luxury motorbikes, and domestic & international vacation tours.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl text-right shrink-0 border border-white/15">
            <span className="text-xs uppercase tracking-wider block opacity-80">Accumulated Pool</span>
            <span className="text-3xl font-black">৳{pool.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border">
          <CardHeader className="pb-2">
            <Smartphone className="h-6 w-6 text-amber-600" />
            <CardTitle className="text-base font-bold mt-2">Gadget Incentives</CardTitle>
          </CardHeader>
          <CardContent><p className="text-xs text-muted-foreground">Smartphones awarded to Gold Managers and top performers.</p></CardContent>
        </Card>

        <Card className="border">
          <CardHeader className="pb-2">
            <Sparkles className="h-6 w-6 text-orange-600" />
            <CardTitle className="text-base font-bold mt-2">Vehicle Incentives</CardTitle>
          </CardHeader>
          <CardContent><p className="text-xs text-muted-foreground">150cc Motorbikes and Private Cars for Diamond & Crown Managers.</p></CardContent>
        </Card>

        <Card className="border">
          <CardHeader className="pb-2">
            <Plane className="h-6 w-6 text-blue-600" />
            <CardTitle className="text-base font-bold mt-2">Luxury Tour Incentives</CardTitle>
          </CardHeader>
          <CardContent><p className="text-xs text-muted-foreground">Fully-paid 5-star tours to Cox’s Bazar and foreign leadership retreats.</p></CardContent>
        </Card>
      </div>
    </div>
  );
}
