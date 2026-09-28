'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  Plane,
  Compass,
  MapPin,
  Luggage,
  Loader2,
  Calendar
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';

export default function TourFundPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFunds() {
      try {
        const res = await fetch('/api/user/funds');
        if (res.ok) setData(await res.json());
      } catch (err) {
        toast.error('Failed to load tour fund info');
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
          <p className="text-xs text-muted-foreground font-semibold">Loading Tour Fund...</p>
        </div>
      </div>
    );
  }

  const pool = data?.globalFunds?.tourFund || 0;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-linear-to-r from-cyan-600 via-sky-600 to-blue-700 p-6 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black">Tour Fund (ট্যুর ফান্ড)</h1>
              <span className="text-xs font-bold bg-white/20 px-2.5 py-0.5 rounded-full">
                5% Allocation
              </span>
            </div>
            <p className="text-xs sm:text-sm opacity-90 mt-1 max-w-xl">
              5% (৳75 BDT) per package activation is preserved in the Tour Fund pool to sponsor domestic and international leadership incentive tours, annual conventions, and retreats.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl text-right shrink-0 border border-white/15">
            <span className="text-xs uppercase tracking-wider block opacity-80">Tour Reserve Balance</span>
            <span className="text-3xl font-black">৳{pool.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border">
          <CardHeader className="pb-1">
            <Plane className="h-6 w-6 text-sky-600 mb-1" />
            <CardTitle className="text-base font-bold">Annual Leadership Retreat</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Fully sponsored 5-star resort retreats for qualifying Managers and Directors.
            </p>
          </CardContent>
        </Card>

        <Card className="border">
          <CardHeader className="pb-1">
            <Compass className="h-6 w-6 text-cyan-600 mb-1" />
            <CardTitle className="text-base font-bold">International Tour Rewards</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Annual overseas tours (Malaysia, Dubai, Thailand) upon achieving leadership rank milestones.
            </p>
          </CardContent>
        </Card>

        <Card className="border">
          <CardHeader className="pb-1">
            <Luggage className="h-6 w-6 text-blue-600 mb-1" />
            <CardTitle className="text-base font-bold">Training & Convention Tours</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Travel allowances and venue accommodations for nationwide mega product launch events.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
