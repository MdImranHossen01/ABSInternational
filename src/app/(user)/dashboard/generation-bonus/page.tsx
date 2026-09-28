'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  Layers,
  Users,
  CheckCircle2,
  Loader2,
  Calendar,
  Percent,
  TrendingUp
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';

export default function GenerationBonusPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFunds() {
      try {
        const res = await fetch('/api/user/funds');
        if (res.ok) setData(await res.json());
      } catch (err) {
        toast.error('Failed to load generation bonus data');
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
          <p className="text-xs text-muted-foreground font-semibold">Loading Generation Bonus...</p>
        </div>
      </div>
    );
  }

  const genTotal = data?.summary?.generationBonus || 0;
  const history = (data?.recentBonusHistory || []).filter((tx: any) =>
    (tx.description || '').toLowerCase().includes('generation')
  );

  const genTiers = [
    { level: 1, split: '40%', amount: '৳42.00', note: 'Direct Sponsor Downlines' },
    { level: 2, split: '20%', amount: '৳21.00', note: 'Level 2 Team Members' },
    { level: 3, split: '10%', amount: '৳10.50', note: 'Level 3 Team Members' },
    { level: 4, split: '6%',  amount: '৳6.30',  note: 'Level 4 Team Members' },
    { level: 5, split: '6%',  amount: '৳6.30',  note: 'Level 5 Team Members' },
    { level: 6, split: '5%',  amount: '৳5.25',  note: 'Level 6 Team Members' },
    { level: 7, split: '5%',  amount: '৳5.25',  note: 'Level 7 Team Members' },
    { level: 8, split: '3%',  amount: '৳3.15',  note: 'Level 8 Team Members' },
    { level: 9, split: '3%',  amount: '৳3.15',  note: 'Level 9 Team Members' },
    { level: 10, split: '2%', amount: '৳2.10',  note: 'Level 10 Deep Network' },
  ];

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="rounded-2xl bg-linear-to-r from-blue-700 via-indigo-700 to-primary p-6 text-white shadow-lg">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <Badge className="bg-blue-300 text-blue-950 font-bold border-0 text-[10px]">
            ১০-জেনারেশন বোনাস
          </Badge>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black">Generation Bonus</h1>
            <p className="text-xs sm:text-sm opacity-90 mt-1 max-w-xl">
              প্রতিটি মেম্বারশিপ প্যাকেজের ৭% (১০৫ টাকা) সমানুপাতে ১ থেকে ১০ম স্তর পর্যন্ত স্বয়ংক্রিয়ভাবে স্প্লিট হয়ে আপনার একাউন্টে জমা হয়।
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl text-right shrink-0 border border-white/15">
            <span className="text-xs uppercase tracking-wider block opacity-80">Total Generation Earnings</span>
            <span className="text-3xl font-black">৳{genTotal.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* 10-Tier Matrix Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" /> 1-10 Generation Payout Matrix (১০ স্তরের বণ্টন তালিকা)
          </CardTitle>
          <CardDescription>
            7% Generation Pool (৳105 BDT per 1,500 package) distributed across downline depths
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-bold">Generation Level</TableHead>
                  <TableHead className="font-bold">Pool Share (%)</TableHead>
                  <TableHead className="font-bold">Commission / Activation</TableHead>
                  <TableHead className="font-bold">Team Tier Note</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {genTiers.map((tier) => (
                  <TableRow key={tier.level} className={tier.level === 1 ? 'bg-primary/5 font-semibold' : ''}>
                    <TableCell className="font-bold flex items-center gap-2">
                      <span className="size-6 rounded-md bg-primary/10 text-primary flex items-center justify-center text-xs">
                        G{tier.level}
                      </span>
                      Generation {tier.level}
                    </TableCell>
                    <TableCell><Badge variant="secondary" className="font-mono font-bold">{tier.split}</Badge></TableCell>
                    <TableCell className="font-mono font-bold text-emerald-600">{tier.amount}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{tier.note}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
