'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  Users2,
  Building,
  GraduationCap,
  Sparkles,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function CommunityFundPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFunds() {
      try {
        const res = await fetch('/api/user/funds');
        if (res.ok) setData(await res.json());
      } catch (err) {
        toast.error('Failed to load community fund info');
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
          <p className="text-xs text-muted-foreground font-semibold">Loading Community Fund...</p>
        </div>
      </div>
    );
  }

  const pool = data?.globalFunds?.communityFund || 0;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-linear-to-r from-indigo-700 via-purple-700 to-primary p-6 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black">Community Fund</h1>
              <span className="text-xs font-bold bg-white/20 px-2.5 py-0.5 rounded-full">
                15% Allocation
              </span>
            </div>
            <p className="text-xs sm:text-sm opacity-90 mt-1 max-w-xl">
              15% (৳225 BDT) from every membership package activation is dedicated to community development, social responsibility, regional member support centers, and local welfare programs.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl text-right shrink-0 border border-white/15">
            <span className="text-xs uppercase tracking-wider block opacity-80">Community Pool Balance</span>
            <span className="text-3xl font-black">৳{pool.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border">
          <CardHeader className="pb-1">
            <Users2 className="h-6 w-6 text-indigo-600 mb-1" />
            <CardTitle className="text-base font-bold">Local Community Support</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Social welfare programs, micro-grant support for community entrepreneurship, and mutual assistance for members in distress.
            </p>
          </CardContent>
        </Card>

        <Card className="border">
          <CardHeader className="pb-1">
            <Building className="h-6 w-6 text-purple-600 mb-1" />
            <CardTitle className="text-base font-bold">Regional Service Hubs</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Establishing regional member training centers, service points, and product pickup centers across all divisions.
            </p>
          </CardContent>
        </Card>

        <Card className="border">
          <CardHeader className="pb-1">
            <GraduationCap className="h-6 w-6 text-primary mb-1" />
            <CardTitle className="text-base font-bold">Youth & Skill Development</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Workshops, digital marketing seminars, and professional leadership development for emerging youth entrepreneurs.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
