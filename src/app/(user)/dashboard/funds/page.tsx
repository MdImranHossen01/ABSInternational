'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  Coins,
  TrendingUp,
  Award,
  HeartHandshake,
  Users,
  Globe,
  Sparkles,
  ShieldCheck,
  Loader2,
  Gift,
  ArrowRight,
  Layers,
  History,
  Plane,
  Users2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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

export default function UserFundsPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFunds() {
      try {
        const res = await fetch('/api/user/funds');
        if (res.ok) {
          const json = await res.json();
          setData(json);
        } else {
          toast.error('Failed to load fund pools data');
        }
      } catch (err) {
        toast.error('Network connection error');
      } finally {
        setLoading(false);
      }
    }
    if (session?.user) {
      fetchFunds();
    }
  }, [session]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-xs text-muted-foreground font-semibold">Loading MLM bonuses & funds...</p>
        </div>
      </div>
    );
  }

  const summary = data?.summary || {};
  const globalFunds = data?.globalFunds || {};
  const history = data?.recentBonusHistory || [];

  // Generation percentage breakdown (10 generations)
  const genBonusBreakdown = [
    { gen: 'Generation 1 (Direct)', percentage: '40%', amountPerActivation: '৳42.00', desc: 'Direct sponsor team member' },
    { gen: 'Generation 2', percentage: '20%', amountPerActivation: '৳21.00', desc: 'Level 2 downline activation' },
    { gen: 'Generation 3', percentage: '10%', amountPerActivation: '৳10.50', desc: 'Level 3 downline activation' },
    { gen: 'Generation 4', percentage: '6%', amountPerActivation: '৳6.30', desc: 'Level 4 downline activation' },
    { gen: 'Generation 5', percentage: '6%', amountPerActivation: '৳6.30', desc: 'Level 5 downline activation' },
    { gen: 'Generation 6', percentage: '5%', amountPerActivation: '৳5.25', desc: 'Level 6 downline activation' },
    { gen: 'Generation 7', percentage: '5%', amountPerActivation: '৳5.25', desc: 'Level 7 downline activation' },
    { gen: 'Generation 8', percentage: '3%', amountPerActivation: '৳3.15', desc: 'Level 8 downline activation' },
    { gen: 'Generation 9', percentage: '3%', amountPerActivation: '৳3.15', desc: 'Level 9 downline activation' },
    { gen: 'Generation 10', percentage: '2%', amountPerActivation: '৳2.10', desc: 'Level 10 downline activation' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl bg-linear-to-r from-emerald-600 via-teal-600 to-primary p-6 text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-emerald-400 text-emerald-950 font-bold border-0">
                10-Generation Bonuses & Fund Pools
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">Bonuses & Global Fund Pools</h1>
            <p className="text-sm opacity-90 mt-1 max-w-2xl">
              Track your Sponsor Bonus, 10-Generation MLM Commissions, and real-time shares from ABS International’s 5 Global Dedicated Funds.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl text-right shrink-0 border border-white/15">
            <span className="text-xs uppercase tracking-wider block opacity-80">Total Earned Bonus</span>
            <span className="text-3xl font-black">৳{(summary.totalBonus || 0).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="bonuses" className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-3 max-w-xl h-auto p-1 bg-muted/60">
          <TabsTrigger value="bonuses" className="py-2.5 text-xs sm:text-sm font-semibold flex items-center gap-2">
            <Coins className="h-4 w-4" /> Sponsor & Gen Bonus
          </TabsTrigger>
          <TabsTrigger value="funds" className="py-2.5 text-xs sm:text-sm font-semibold flex items-center gap-2">
            <Globe className="h-4 w-4" /> 5 Global Funds
          </TabsTrigger>
          <TabsTrigger value="history" className="py-2.5 text-xs sm:text-sm font-semibold flex items-center gap-2 col-span-2 md:col-span-1">
            <History className="h-4 w-4" /> Bonus Ledger
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: Sponsor & Generation Bonus */}
        <TabsContent value="bonuses" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Sponsor Bonus Card (Point 9) */}
            <Card className="border-primary/20 bg-linear-to-br from-primary/5 to-transparent">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="border-primary text-primary font-bold">
                    Direct
                  </Badge>
                  <Coins className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-base font-bold mt-2">Sponsor Bonus</CardTitle>
                <CardDescription>Direct 15% (৳225) per joining</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black text-primary">৳{(summary.sponsorBonus || 0).toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-2">
                  Instant credit to your bonus wallet for every direct referral who activates their account.
                </p>
              </CardContent>
            </Card>

            {/* Generation Bonus Card (Point 10) */}
            <Card className="border-blue-500/20 bg-linear-to-br from-blue-500/5 to-transparent">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="border-blue-500 text-blue-600 font-bold">
                    Team
                  </Badge>
                  <Layers className="h-5 w-5 text-blue-600" />
                </div>
                <CardTitle className="text-base font-bold mt-2">Generation Bonus</CardTitle>
                <CardDescription>Up to 10-Generations deep (7% Pool)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black text-blue-700">৳{(summary.generationBonus || 0).toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-2">
                  Distributed across 10 generations on every new member joining anywhere in your team.
                </p>
              </CardContent>
            </Card>

            {/* Auto-Profit Matrix Bonus */}
            <Card className="border-emerald-500/20 bg-linear-to-br from-emerald-500/5 to-transparent">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="border-emerald-500 text-emerald-600 font-bold">
                    Matrix Pool
                  </Badge>
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                </div>
                <CardTitle className="text-base font-bold mt-2">Auto Profit Matrix</CardTitle>
                <CardDescription>3.5% (৳52) Automated Pool</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black text-emerald-700">৳{(summary.autoProfitBonus || 0).toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-2">
                  Automated milestone tiers from ৳240 up to ৳12 Crore as team activations grow.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* 10 Generation Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                10-Generation Bonus Distribution Structure
              </CardTitle>
              <CardDescription>
                7% (105 BDT) from each 1,500 BDT membership package is distributed proportionally across 10 generation tiers.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-bold">Generation Level</TableHead>
                      <TableHead className="font-bold">Pool Share (%)</TableHead>
                      <TableHead className="font-bold">Payout Amount</TableHead>
                      <TableHead className="font-bold">Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {genBonusBreakdown.map((row, idx) => (
                      <TableRow key={idx} className={idx === 0 ? 'bg-primary/5 font-semibold' : ''}>
                        <TableCell className="font-medium flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-primary" />
                          {row.gen}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="font-mono font-bold">
                            {row.percentage}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono font-bold text-emerald-600">
                          {row.amountPerActivation}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {row.desc}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: The 5 Dedicated Global Funds (Points 11, 12, 13, 14, 15) */}
        <TabsContent value="funds" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

            {/* 11. Global Profit */}
            <Card className="border border-purple-500/20 bg-linear-to-b from-purple-500/[0.03] to-transparent">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-200">
                    2% Pool
                  </Badge>
                  <Globe className="h-5 w-5 text-purple-600" />
                </div>
                <CardTitle className="text-base font-bold mt-2">Global Profit Fund</CardTitle>
                <CardDescription>2% (৳30) per activation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-3xl font-black text-purple-900 dark:text-purple-300">
                  ৳{(globalFunds.globalProfit || 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Global profit pool accumulated from platform memberships, distributed equally across all active members.
                </p>
                <div className="pt-2 text-[11px] text-purple-700 dark:text-purple-400 font-semibold">
                  Status: Active & Accumulating
                </div>
              </CardContent>
            </Card>

            {/* 12. Incentive Fund */}
            <Card className="border border-amber-500/20 bg-linear-to-b from-amber-500/[0.03] to-transparent">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-200">
                    2% Pool
                  </Badge>
                  <Gift className="h-5 w-5 text-amber-600" />
                </div>
                <CardTitle className="text-base font-bold mt-2">Incentive Fund</CardTitle>
                <CardDescription>2% (৳30) per activation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-3xl font-black text-amber-900 dark:text-amber-300">
                  ৳{(globalFunds.incentiveFund || 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Special incentive fund reserved for high-performing leaders, smartphones, motorbikes, and travel rewards.
                </p>
                <div className="pt-2 text-[11px] text-amber-700 dark:text-amber-400 font-semibold">
                  Used For: Special Performer Rewards
                </div>
              </CardContent>
            </Card>

            {/* 13. Rank Development Fund */}
            <Card className="border border-cyan-500/20 bg-linear-to-b from-cyan-500/[0.03] to-transparent">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <Badge className="bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300 border-cyan-200">
                    2.5% Pool
                  </Badge>
                  <Sparkles className="h-5 w-5 text-cyan-600" />
                </div>
                <CardTitle className="text-base font-bold mt-2">Rank Development Fund</CardTitle>
                <CardDescription>2.5% (৳37.5) per activation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-3xl font-black text-cyan-900 dark:text-cyan-300">
                  ৳{(globalFunds.rankDevelopmentFund || 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Dedicated fund for instant cash promotion bonuses awarded upon reaching new leadership and manager ranks.
                </p>
                <div className="pt-2 text-[11px] text-cyan-700 dark:text-cyan-400 font-semibold">
                  Used For: Rank Upgrade Cash Payouts
                </div>
              </CardContent>
            </Card>

            {/* 14. Royalty Fund */}
            <Card className="border border-indigo-500/20 bg-linear-to-b from-indigo-500/[0.03] to-transparent">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-200">
                    2% Pool
                  </Badge>
                  <Award className="h-5 w-5 text-indigo-600" />
                </div>
                <CardTitle className="text-base font-bold mt-2">Royalty Fund</CardTitle>
                <CardDescription>2% (৳30) per activation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-3xl font-black text-indigo-900 dark:text-indigo-300">
                  ৳{(globalFunds.royaltyFund || 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Lifetime executive royalty pool for top-tier Diamond Managers, Crown Managers, and Company Directors.
                </p>
                <div className="pt-2 text-[11px] text-indigo-700 dark:text-indigo-400 font-semibold">
                  Eligibility: Diamond Manager & Above
                </div>
              </CardContent>
            </Card>

            {/* 15. Tour Fund */}
            <Card className="border border-sky-500/20 bg-linear-to-b from-sky-500/[0.03] to-transparent">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <Badge className="bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border-sky-200">
                    5% Pool
                  </Badge>
                  <Plane className="h-5 w-5 text-sky-600" />
                </div>
                <CardTitle className="text-base font-bold mt-2">Tour Fund</CardTitle>
                <CardDescription>5% (৳75) per activation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-3xl font-black text-sky-900 dark:text-sky-300">
                  ৳{(globalFunds.tourFund || 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Domestic and international travel incentive fund for qualifying leaders and managers.
                </p>
                <div className="pt-2 text-[11px] text-sky-700 dark:text-sky-400 font-semibold">
                  Used For: Domestic & International Tours
                </div>
              </CardContent>
            </Card>

            {/* 16. Community Fund */}
            <Card className="border border-purple-500/20 bg-linear-to-b from-purple-500/[0.03] to-transparent">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-200">
                    15% Pool
                  </Badge>
                  <Users2 className="h-5 w-5 text-purple-600" />
                </div>
                <CardTitle className="text-base font-bold mt-2">Community Fund</CardTitle>
                <CardDescription>15% (৳225) per activation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-3xl font-black text-purple-900 dark:text-purple-300">
                  ৳{(globalFunds.communityFund || 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Community development, regional member service hubs, and social welfare programs.
                </p>
                <div className="pt-2 text-[11px] text-purple-700 dark:text-purple-400 font-semibold">
                  Used For: Regional Centers & Community Welfare
                </div>
              </CardContent>
            </Card>

            {/* 17. Charity Fund */}
            <Card className="border border-rose-500/20 bg-linear-to-b from-rose-500/[0.03] to-transparent">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <Badge className="bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-200">
                    1% Pool
                  </Badge>
                  <HeartHandshake className="h-5 w-5 text-rose-600" />
                </div>
                <CardTitle className="text-base font-bold mt-2">Charity Fund</CardTitle>
                <CardDescription>1% (৳15) per activation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-3xl font-black text-rose-900 dark:text-rose-300">
                  ৳{(globalFunds.charityFund || 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  ABS International Corporate Social Responsibility (CSR) fund supporting orphans, destitute families, and healthcare.
                </p>
                <div className="pt-2 text-[11px] text-rose-700 dark:text-rose-400 font-semibold">
                  Social Welfare & Medical Assistance
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB 3: Bonus History */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <History className="h-4 w-4 text-primary" /> My Recent Bonus Transactions
              </CardTitle>
              <CardDescription>Detailed statement of sponsor, generation, and promotion bonuses</CardDescription>
            </CardHeader>
            <CardContent>
              {history.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  No bonus transactions found yet. Invite members to start earning sponsor and generation bonuses!
                </div>
              ) : (
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {history.map((tx: any) => (
                        <TableRow key={tx._id}>
                          <TableCell className="text-xs font-mono">
                            {new Date(tx.createdAt).toLocaleDateString()} {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize text-emerald-600 border-emerald-500/30 bg-emerald-500/5">
                              {tx.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs max-w-xs truncate">{tx.description}</TableCell>
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
