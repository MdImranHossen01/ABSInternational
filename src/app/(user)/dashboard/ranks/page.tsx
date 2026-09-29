'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import {
  Award,
  Crown,
  Trophy,
  Star,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  Gift,
  Camera,
  History,
  Info,
  Loader2,
  Gem,
  Landmark,
  UserCheck
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';

export default function UserRanksPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRanks() {
      try {
        const res = await fetch('/api/user/ranks');
        if (res.ok) {
          const json = await res.json();
          setData(json);
        } else {
          toast.error('Failed to load rank & rewards data');
        }
      } catch (err) {
        toast.error('Network connection error');
      } finally {
        setLoading(false);
      }
    }
    if (session?.user) {
      fetchRanks();
    }
  }, [session]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-xs text-muted-foreground font-semibold">Loading rank achievements...</p>
        </div>
      </div>
    );
  }

  const currentRank = data?.currentRank || 'user';
  const nextRank = data?.nextRank;
  const ranksMaster = data?.ranksMaster || [];
  const topAchievers = data?.topAchievers || [];
  const rewardTransactions = data?.rewardTransactions || [];

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="rounded-2xl bg-linear-to-r from-amber-600 via-orange-600 to-primary p-6 text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-amber-300 text-amber-950 font-bold border-0">
                Ranks, Rewards & Achievements
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">Rank System & Career Rewards</h1>
            <p className="text-sm opacity-90 mt-1 max-w-2xl">
              Elevate your career with ABS International. Complete milestones to earn cash bonuses, smartphones, luxury motorbikes, private cars, and overseas tours.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl text-center md:text-right shrink-0 border border-white/15">
            <span className="text-xs uppercase tracking-wider block opacity-80">Current Rank</span>
            <div className="flex items-center justify-center md:justify-end gap-2 mt-1">
              <Trophy className="h-6 w-6 text-amber-300" />
              <span className="text-2xl font-black">{currentRank}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Point 26: Rank Progress Card */}
      <Card className="border-amber-500/20 bg-linear-to-r from-amber-500/5 to-transparent">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-amber-600" />
                Rank Progress & Next Target
              </CardTitle>
              <CardDescription>
                Track your active direct leaders to qualify for the next prestigious rank.
              </CardDescription>
            </div>
            {nextRank && (
              <Badge className="bg-primary text-white font-bold py-1 px-3 self-start sm:self-auto">
                Next Target: {nextRank.title}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs sm:text-sm font-semibold gap-1">
            <span>{data?.progressLabel}</span>
            <span className="text-primary font-bold">{data?.progressPercentage}% Completed</span>
          </div>
          <Progress value={data?.progressPercentage || 0} className="h-3.5 bg-muted" />
          {nextRank && (
            <div className="p-3 bg-muted/50 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <Gift className="h-4 w-4 text-amber-600 shrink-0" />
                <span>
                  <strong>Unlock Reward at {nextRank.title}:</strong> {nextRank.reward}
                </span>
              </div>
              <span className="font-mono font-bold text-emerald-600 shrink-0">
                +৳{(nextRank.bonus || 0).toLocaleString()} Cash Bonus
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Tabs for Rank System, Rewards, Achievers, History */}
      <Tabs defaultValue="system" className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 max-w-2xl h-auto p-1 bg-muted/60">
          <TabsTrigger value="system" className="py-2.5 text-xs sm:text-sm font-semibold flex items-center gap-1.5">
            <Trophy className="h-4 w-4" /> Rank System
          </TabsTrigger>
          <TabsTrigger value="rewards" className="py-2.5 text-xs sm:text-sm font-semibold flex items-center gap-1.5">
            <Gift className="h-4 w-4" /> Rank Rewards
          </TabsTrigger>
          <TabsTrigger value="achievers" className="py-2.5 text-xs sm:text-sm font-semibold flex items-center gap-1.5">
            <Camera className="h-4 w-4" /> Achiever Photos
          </TabsTrigger>
          <TabsTrigger value="history" className="py-2.5 text-xs sm:text-sm font-semibold flex items-center gap-1.5">
            <History className="h-4 w-4" /> Reward History
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: 25. Rank System & Criteria */}
        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                ABS International Rank System & Qualification Matrix
              </CardTitle>
              <CardDescription>
                Career plan advancement requirements and promotion criteria for each leadership rank tier.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-bold">Rank</TableHead>
                      <TableHead className="font-bold">Qualification</TableHead>
                      <TableHead className="font-bold">Cash Bonus</TableHead>
                      <TableHead className="font-bold">Incentives & Rewards</TableHead>
                      <TableHead className="font-bold text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ranksMaster.map((r: any, idx: number) => {
                      const isAchieved =
                        currentRank === r.id ||
                        (currentRank !== 'user' && idx < ranksMaster.findIndex((x: any) => x.id === currentRank));

                      return (
                        <TableRow key={r.id} className={currentRank === r.id ? 'bg-primary/5 font-semibold' : ''}>
                          <TableCell className="font-bold flex items-center gap-2">
                            <span className="p-1 rounded bg-muted text-primary">
                              <Trophy className="h-4 w-4" />
                            </span>
                            {r.title}
                          </TableCell>
                          <TableCell className="text-xs">{r.requirement}</TableCell>
                          <TableCell className="font-mono font-bold text-emerald-600">
                            {r.bonus > 0 ? `৳${r.bonus.toLocaleString()}` : '—'}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground font-medium">{r.reward}</TableCell>
                          <TableCell className="text-center">
                            {currentRank === r.id ? (
                              <Badge className="bg-emerald-600 text-white font-bold">Current</Badge>
                            ) : isAchieved ? (
                              <Badge variant="outline" className="text-emerald-600 border-emerald-500">Achieved</Badge>
                            ) : (
                              <Badge variant="secondary" className="text-muted-foreground">Locked</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: 27. Rank Rewards Showcase */}
        <TabsContent value="rewards" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ranksMaster
              .filter((r: any) => r.bonus > 0)
              .map((item: any, idx: number) => (
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
                        ৳{(item.bonus || 0).toLocaleString()} BDT
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        {/* TAB 3: 28. Achiever Photos / Hall of Fame */}
        <TabsContent value="achievers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Camera className="h-5 w-5 text-primary" />
                Achievement Photo Gallery (Hall of Fame)
              </CardTitle>
              <CardDescription>
                Celebrate our top leadership achievers who reached prestigious manager and crown tiers.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {topAchievers.map((achiever: any, idx: number) => (
                  <div key={idx} className="group rounded-xl border bg-card overflow-hidden shadow-xs hover:shadow-md transition-all">
                    <div className="h-44 bg-linear-to-b from-primary/20 via-muted to-muted flex items-center justify-center relative">
                      <div className="size-20 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center text-primary font-black text-xl">
                        {achiever.name.charAt(0)}
                      </div>
                      <Badge className="absolute top-2 right-2 bg-amber-500 text-white font-bold text-[10px]">
                        {achiever.rank}
                      </Badge>
                    </div>
                    <div className="p-4 space-y-1.5">
                      <h4 className="font-bold text-sm text-foreground">{achiever.name}</h4>
                      <p className="text-xs text-muted-foreground">{achiever.city}, Bangladesh</p>
                      <div className="pt-2 text-[11px] text-primary font-semibold border-t">
                        Awarded: {achiever.reward}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 4: 29. Reward History */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <History className="h-4 w-4 text-primary" />
                My Reward & Promotion History
              </CardTitle>
              <CardDescription>Record of bonuses and gifts received through rank advancements</CardDescription>
            </CardHeader>
            <CardContent>
              {rewardTransactions.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  You have not received any rank promotion rewards yet. Build your 6 active direct downlines to earn your first Team Manager bonus!
                </div>
              ) : (
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>Date</TableHead>
                        <TableHead>Event</TableHead>
                        <TableHead className="text-right">Amount Awarded</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rewardTransactions.map((tx: any) => (
                        <TableRow key={tx._id}>
                          <TableCell className="text-xs font-mono">
                            {new Date(tx.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-xs font-medium">{tx.description}</TableCell>
                          <TableCell className="text-right font-mono font-bold text-emerald-600">
                            +৳{(tx.amount || 0).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
