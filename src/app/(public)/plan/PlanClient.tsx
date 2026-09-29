'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Award,
  Crown,
  Trophy,
  Users,
  Wallet,
  TrendingUp,
  Gift,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Layers,
  HeartHandshake,
  DollarSign,
  PieChart,
  Network,
  CreditCard,
  Building,
  UserCheck,
  Stethoscope,
  Plane,
  Car,
  Home,
  Smartphone,
  ChevronRight,
  HelpCircle,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface PlanClientProps {
  brandName?: string;
}

export default function PlanClient({ brandName = 'ABS International' }: PlanClientProps) {
  const [activeTab, setActiveTab] = useState('overview');

  // Generation bonus levels data (out of 105 BDT pool = 7% of 1500 BDT)
  const generationData = [
    { level: 1, percent: '40%', amount: '৳42.00', teamExample: '6', earningsExample: '৳252' },
    { level: 2, percent: '20%', amount: '৳21.00', teamExample: '36', earningsExample: '৳756' },
    { level: 3, percent: '10%', amount: '৳10.50', teamExample: '216', earningsExample: '৳2,268' },
    { level: 4, percent: '6%', amount: '৳6.30', teamExample: '1,296', earningsExample: '৳8,164' },
    { level: 5, percent: '6%', amount: '৳6.30', teamExample: '7,776', earningsExample: '৳48,988' },
    { level: 6, percent: '5%', amount: '৳5.25', teamExample: '46,656', earningsExample: '৳244,944' },
    { level: 7, percent: '5%', amount: '৳5.25', teamExample: '279,936', earningsExample: '৳1,469,664' },
    { level: 8, percent: '3%', amount: '৳3.15', teamExample: '1,679,616', earningsExample: '৳5,290,790' },
    { level: 9, percent: '3%', amount: '৳3.15', teamExample: '10,077,696', earningsExample: '৳31,744,742' },
    { level: 10, percent: '2%', amount: '৳2.10', teamExample: '60,466,176', earningsExample: '৳126,978,969' },
  ];

  // Auto Profit Club Tiers (10 Tiers)
  const autoProfitTiers = [
    { tier: 1, payout: '৳240', badge: 'Tier 1' },
    { tier: 2, payout: '৳720', badge: 'Tier 2' },
    { tier: 3, payout: '৳2,160', badge: 'Tier 3' },
    { tier: 4, payout: '৳7,776', badge: 'Tier 4' },
    { tier: 5, payout: '৳46,656', badge: 'Tier 5' },
    { tier: 6, payout: '৳2,33,280', badge: 'Tier 6' },
    { tier: 7, payout: '৳13,99,680', badge: 'Tier 7' },
    { tier: 8, payout: '৳50,38,848', badge: 'Tier 8' },
    { tier: 9, payout: '৳3,02,33,088', badge: 'Tier 9' },
    { tier: 10, payout: '৳12,09,32,352', badge: 'Grand Pool' },
  ];

  // 9 Leadership Ranks
  const ranks = [
    {
      id: 'general',
      title: 'General Member',
      req: 'Free Account Registration',
      downlines: '0 Directs',
      cashBonus: '৳0',
      reward: 'Member dashboard, store browsing & retail buying',
      badgeColor: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300',
      icon: <Users className="h-6 w-6 text-slate-500" />,
    },
    {
      id: 'premium',
      title: 'Premium Member',
      req: 'Activate with ৳1,500 Package',
      downlines: '1 Active Package',
      cashBonus: '৳225 Sponsor Bonus per referral',
      reward: 'Seba Card privileges, 10-Gen commission & Auto-Profit Matrix',
      badgeColor: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300',
      icon: <ShieldCheck className="h-6 w-6 text-emerald-600" />,
    },
    {
      id: 'team_mgr',
      title: 'Team Manager',
      req: '6 Active Direct Premium Members',
      downlines: '6 Active Directs',
      cashBonus: '৳200 Cash Bonus',
      reward: 'Official Digital Seba Card & Team Manager Crest',
      badgeColor: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-300',
      icon: <Award className="h-6 w-6 text-blue-600" />,
    },
    {
      id: 'royal_mgr',
      title: 'Royal Manager',
      req: '6 Team Managers in Direct Network',
      downlines: '6 Team Managers',
      cashBonus: '৳1,000 Cash Bonus',
      reward: '5-Star Hotel Buffet Lunch & Leadership Certificate',
      badgeColor: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-300',
      icon: <Crown className="h-6 w-6 text-indigo-600" />,
    },
    {
      id: 'silver_mgr',
      title: 'Silver Manager',
      req: '6 Royal Managers in Direct Network',
      downlines: '6 Royal Managers',
      cashBonus: '৳6,000 Cash Bonus',
      reward: 'Leadership Recognition Crest & Executive Buffet Lunch',
      badgeColor: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300 border-cyan-300',
      icon: <Sparkles className="h-6 w-6 text-cyan-600" />,
    },
    {
      id: 'gold_mgr',
      title: 'Gold Manager',
      req: '6 Silver Managers in Direct Network',
      downlines: '6 Silver Managers',
      cashBonus: '৳10,000 Incentive Fund',
      reward: 'Branded Smartphone & National Conference Stage Honor',
      badgeColor: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-amber-300',
      icon: <Smartphone className="h-6 w-6 text-amber-600" />,
    },
    {
      id: 'diamond_mgr',
      title: 'Diamond Manager',
      req: '6 Gold Managers in Direct Network',
      downlines: '6 Gold Managers',
      cashBonus: '৳35,000 Fund Share',
      reward: 'Brand New Motorbike + Luxury Cox’s Bazar Tour',
      badgeColor: 'bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300 border-violet-300',
      icon: <Plane className="h-6 w-6 text-violet-600" />,
    },
    {
      id: 'crown_mgr',
      title: 'Crown Manager',
      req: '6 Diamond Managers in Direct Network',
      downlines: '6 Diamond Managers',
      cashBonus: '৳1,20,000 Royalty Fund',
      reward: 'Private Luxury Car + VIP Tour Package',
      badgeColor: 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border-rose-300',
      icon: <Car className="h-6 w-6 text-rose-600" />,
    },
    {
      id: 'director',
      title: 'Company Director',
      req: '6 Crown Managers in Direct Network',
      downlines: '6 Crown Managers',
      cashBonus: '৳5,00,000 Cash Bonus',
      reward: '1 Crore Flat / Lifetime Company Equity Share',
      badgeColor: 'bg-yellow-50 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200 border-yellow-400',
      icon: <Home className="h-6 w-6 text-amber-500" />,
    },
  ];

  // 10 Funds Distribution (out of 1500 BDT)
  const fundDistribution = [
    { name: '1. Direct Sponsor Bonus', pct: '15.0%', bdt: '৳225.00', desc: 'Direct referral incentive credited immediately to sponsor' },
    { name: '2. Generation Bonus Pool', pct: '7.0%', bdt: '৳105.00', desc: 'Distributed across 10 generations in upline hierarchy' },
    { name: '3. Community Fund', pct: '15.0%', bdt: '৳225.00', desc: 'Dedicated to community upliftment and member welfare' },
    { name: '4. Tour Fund', pct: '5.0%', bdt: '৳75.00', desc: 'Accumulated for domestic & international leadership travel' },
    { name: '5. Auto Profit Club', pct: '3.5%', bdt: '৳52.50', desc: 'Powers the 10-tier automated matrix pool payouts' },
    { name: '6. Rank Development Fund', pct: '2.5%', bdt: '৳37.50', desc: 'Fund pool for rank advancement crests and prizes' },
    { name: '7. Incentive Fund', pct: '2.0%', bdt: '৳30.00', desc: 'Smartphone, laptop, and promotional campaign incentives' },
    { name: '8. Global Profit Fund', pct: '2.0%', bdt: '৳30.00', desc: 'Quarterly dividend sharing for qualified top leaders' },
    { name: '9. Royalty Fund', pct: '2.0%', bdt: '৳30.00', desc: 'Ongoing royalty distributions for Diamond, Crown & Directors' },
    { name: '10. Charity & Social Welfare', pct: '1.0%', bdt: '৳15.00', desc: 'Emergency relief, medical assistance, and social charity' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      
      {/* ─── Hero Section ────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 via-background to-background pt-12 pb-16 md:pt-20 md:pb-24 border-b border-border/40">
        <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
        <div className="container mx-auto px-4 text-center max-w-5xl relative z-10">
          <Badge variant="outline" className="mb-4 px-4 py-1.5 border-primary/30 text-primary bg-primary/5 text-xs md:text-sm font-semibold tracking-wide uppercase rounded-full">
            ⭐ Official Business &amp; Member Plan
          </Badge>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-foreground">
            Build Long-Term Wealth with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-primary">
              {brandName}
            </span>
          </h1>

          <p className="mt-4 sm:mt-6 text-sm sm:text-base md:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Our comprehensive compensation plan is crafted for fairness, sustainability, and rapid growth. Experience transparent 10-generation earnings, 3-wallet fund management, automated club rewards, and lifetime leadership prestige.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <Link href="/register">
              <Button size="lg" className="rounded-full px-6 sm:px-8 font-bold gap-2 shadow-lg shadow-primary/25">
                Join As Member <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="rounded-full px-6 sm:px-8 font-bold">
                Member Login
              </Button>
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-12 max-w-4xl mx-auto text-left">
            <div className="p-4 rounded-2xl bg-card border border-border/60 shadow-xs">
              <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Joining Package</div>
              <div className="text-xl sm:text-2xl font-black text-primary mt-1">৳1,500</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">With Herbal Products</div>
            </div>
            <div className="p-4 rounded-2xl bg-card border border-border/60 shadow-xs">
              <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Direct Sponsor</div>
              <div className="text-xl sm:text-2xl font-black text-emerald-600 mt-1">15% (৳225)</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">Instant Wallet Credit</div>
            </div>
            <div className="p-4 rounded-2xl bg-card border border-border/60 shadow-xs">
              <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Generation Depth</div>
              <div className="text-xl sm:text-2xl font-black text-teal-600 mt-1">10 Levels</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">7% Total Fund Pool</div>
            </div>
            <div className="p-4 rounded-2xl bg-card border border-border/60 shadow-xs">
              <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Leadership Ranks</div>
              <div className="text-xl sm:text-2xl font-black text-amber-500 mt-1">9 Ranks</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">Cash + Luxury Assets</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Navigation Tabs ────────────────────────────────────────── */}
      <section className="container mx-auto px-4 mt-8 max-w-6xl">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="overflow-x-auto pb-2 scrollbar-none">
            <TabsList className="h-auto p-1.5 bg-muted/60 rounded-2xl flex w-full min-w-[620px] justify-between border border-border/50">
              <TabsTrigger value="overview" className="rounded-xl py-2.5 px-3 text-xs sm:text-sm font-bold flex items-center gap-2">
                <PieChart className="h-4 w-4" /> Member Plan
              </TabsTrigger>
              <TabsTrigger value="generation" className="rounded-xl py-2.5 px-3 text-xs sm:text-sm font-bold flex items-center gap-2">
                <Network className="h-4 w-4" /> Generation System
              </TabsTrigger>
              <TabsTrigger value="profile" className="rounded-xl py-2.5 px-3 text-xs sm:text-sm font-bold flex items-center gap-2">
                <Wallet className="h-4 w-4" /> Profile &amp; Wallets
              </TabsTrigger>
              <TabsTrigger value="reward" className="rounded-xl py-2.5 px-3 text-xs sm:text-sm font-bold flex items-center gap-2">
                <Gift className="h-4 w-4" /> Reward System
              </TabsTrigger>
              <TabsTrigger value="rank" className="rounded-xl py-2.5 px-3 text-xs sm:text-sm font-bold flex items-center gap-2">
                <Trophy className="h-4 w-4" /> Rank System
              </TabsTrigger>
            </TabsList>
          </div>

          {/* ══════════════════════════════════════════════════════════════
              TAB 1: MEMBER PLAN & PACKAGES OVERVIEW
             ══════════════════════════════════════════════════════════════ */}
          <TabsContent value="overview" className="mt-8 space-y-10">
            {/* Packages Comparison */}
            <div>
              <div className="text-center max-w-2xl mx-auto mb-8">
                <h2 className="text-2xl sm:text-3xl font-black">Membership Package Options</h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                  Choose between standard shopping or unlock all affiliate and multi-generation earnings with our Premium membership.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {/* General Member Card */}
                <Card className="rounded-2xl border border-border shadow-xs hover:border-border/80 transition-all flex flex-col justify-between">
                  <div>
                    <CardHeader className="pb-4">
                      <Badge variant="secondary" className="w-fit mb-2">Free Account</Badge>
                      <CardTitle className="text-2xl font-black">General Member</CardTitle>
                      <CardDescription>Ideal for everyday shoppers and retail customers</CardDescription>
                      <div className="text-3xl font-black text-foreground mt-4">৳0 <span className="text-xs font-normal text-muted-foreground">/ Lifetime</span></div>
                    </CardHeader>
                    <CardContent className="space-y-3 pt-2">
                      <div className="flex items-center gap-2.5 text-xs sm:text-sm">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" /> Free registration with basic profile
                      </div>
                      <div className="flex items-center gap-2.5 text-xs sm:text-sm">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" /> Browse &amp; purchase original products
                      </div>
                      <div className="flex items-center gap-2.5 text-xs sm:text-sm">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" /> Order tracking and invoice history
                      </div>
                      <div className="flex items-center gap-2.5 text-xs sm:text-sm text-muted-foreground opacity-60">
                        <span className="h-4 w-4 rounded-full border border-muted-foreground flex items-center justify-center text-[10px] shrink-0">✕</span> No MLM Commission Rights
                      </div>
                      <div className="flex items-center gap-2.5 text-xs sm:text-sm text-muted-foreground opacity-60">
                        <span className="h-4 w-4 rounded-full border border-muted-foreground flex items-center justify-center text-[10px] shrink-0">✕</span> No Seba Health Card Privileges
                      </div>
                    </CardContent>
                  </div>
                  <div className="p-6 pt-0">
                    <Link href="/register" className="block w-full">
                      <Button variant="outline" className="w-full rounded-xl font-bold">Register Free</Button>
                    </Link>
                  </div>
                </Card>

                {/* Premium Member Card */}
                <Card className="rounded-2xl border-2 border-primary shadow-xl bg-gradient-to-b from-primary/5 via-card to-card flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-black uppercase px-3 py-1 rounded-bl-xl tracking-wider">
                    Recommended
                  </div>
                  <div>
                    <CardHeader className="pb-4">
                      <Badge className="w-fit mb-2 bg-primary/20 text-primary hover:bg-primary/25 border-primary/30">Active MLM Tier</Badge>
                      <CardTitle className="text-2xl font-black text-foreground">Premium Member</CardTitle>
                      <CardDescription>Full access to multi-tier earnings and healthcare benefits</CardDescription>
                      <div className="text-3xl font-black text-primary mt-4">৳1,500 <span className="text-xs font-normal text-muted-foreground">/ One-Time</span></div>
                    </CardHeader>
                    <CardContent className="space-y-3 pt-2">
                      <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-foreground">
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0" /> High-Value Herbal Products Included
                      </div>
                      <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-foreground">
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0" /> 15% (৳225) Direct Sponsor Commission
                      </div>
                      <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-foreground">
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0" /> Full 10-Generation Downline Matrix Eligibility
                      </div>
                      <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-foreground">
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0" /> Digital Seba Card (Hospital &amp; Doctor Discounts)
                      </div>
                      <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-foreground">
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0" /> Auto-Profit Matrix Tier Participation (10 Tiers)
                      </div>
                      <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-foreground">
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0" /> Rank Advancement &amp; Executive Milestone Gifts
                      </div>
                    </CardContent>
                  </div>
                  <div className="p-6 pt-0">
                    <Link href="/register" className="block w-full">
                      <Button className="w-full rounded-xl font-bold shadow-md shadow-primary/25">Activate Package Now</Button>
                    </Link>
                  </div>
                </Card>
              </div>
            </div>

            {/* 55% Transparent Allocation Breakdown */}
            <Card className="rounded-2xl border border-border shadow-xs overflow-hidden">
              <CardHeader className="bg-muted/40 border-b border-border/50 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <CardTitle className="text-lg sm:text-xl font-black">1,500 BDT Package Fund Distribution (55% Allocation)</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      Transparent split: ৳825 (55%) distributed to members &amp; welfare funds, ৳675 (45%) allocated for product cost &amp; operational infrastructure.
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="w-fit font-mono font-bold text-primary border-primary/40 bg-primary/5">
                    Total Pool: ৳825.00
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-muted/30 text-muted-foreground uppercase text-[11px] font-bold border-b border-border/40">
                      <tr>
                        <th className="py-3 px-4">Fund Name</th>
                        <th className="py-3 px-4">Percentage</th>
                        <th className="py-3 px-4">Amount</th>
                        <th className="py-3 px-4 hidden md:table-cell">Purpose &amp; Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {fundDistribution.map((fund, idx) => (
                        <tr key={idx} className="hover:bg-muted/20 transition-colors">
                          <td className="py-3 px-4 font-bold text-foreground">{fund.name}</td>
                          <td className="py-3 px-4 font-mono font-semibold text-primary">{fund.pct}</td>
                          <td className="py-3 px-4 font-mono font-bold text-emerald-600">{fund.bdt}</td>
                          <td className="py-3 px-4 text-muted-foreground hidden md:table-cell">{fund.desc}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ══════════════════════════════════════════════════════════════
              TAB 2: GENERATION SYSTEM (10-GENERATION MLM MATRIX)
             ══════════════════════════════════════════════════════════════ */}
          <TabsContent value="generation" className="mt-8 space-y-8">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-black">10-Generation Downline Matrix</h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                A 7% pool (৳105 BDT per activation) is split across 10 upline generations. With our 6-hand placement structure, spillover helps your team grow exponentially.
              </p>
            </div>

            {/* Matrix Feature Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="rounded-2xl p-5 border border-border shadow-xs">
                <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold mb-3">
                  <Network className="h-5 w-5" />
                </div>
                <div className="text-base font-bold">6-Hand Placement</div>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Each leader can sponsor direct hands from Hand 1 to Hand 6. Excess members spill over to downlines, creating massive teamwork.
                </p>
              </Card>

              <Card className="rounded-2xl p-5 border border-border shadow-xs">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold mb-3">
                  <DollarSign className="h-5 w-5" />
                </div>
                <div className="text-base font-bold">Instant Payouts</div>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  The exact generation commission is instantly deposited into your Bonus Wallet the moment any downline member activates.
                </p>
              </Card>

              <Card className="rounded-2xl p-5 border border-border shadow-xs">
                <div className="h-10 w-10 rounded-xl bg-teal-500/10 text-teal-600 flex items-center justify-center font-bold mb-3">
                  <Layers className="h-5 w-5" />
                </div>
                <div className="text-base font-bold">10-Level Depth</div>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Earn from your direct partners (Gen 1) down to the 10th generation level without tricky flushing or unachievable hurdles.
                </p>
              </Card>
            </div>

            {/* 10 Generation Table */}
            <Card className="rounded-2xl border border-border shadow-xs overflow-hidden">
              <CardHeader className="bg-muted/40 border-b border-border/50 pb-4">
                <CardTitle className="text-base sm:text-lg font-black">Generational Commission Split &amp; Duplication Model</CardTitle>
                <CardDescription className="text-xs">
                  Theoretical earning potential assuming a standard 6 × 6 duplication matrix across all 10 generation tiers.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-muted/30 text-muted-foreground uppercase text-[11px] font-bold border-b border-border/40">
                      <tr>
                        <th className="py-3 px-4">Tier Level</th>
                        <th className="py-3 px-4">Pool Share</th>
                        <th className="py-3 px-4">Payout / Activation</th>
                        <th className="py-3 px-4">Team Count (6x6)</th>
                        <th className="py-3 px-4 text-right">Potential Tier Earnings</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40 font-mono">
                      {generationData.map((gen) => (
                        <tr key={gen.level} className="hover:bg-muted/20 transition-colors">
                          <td className="py-3 px-4 font-sans font-bold text-foreground">
                            Generation {gen.level} {gen.level === 1 && <span className="text-[10px] text-primary ml-1 font-normal">(Direct)</span>}
                          </td>
                          <td className="py-3 px-4 font-bold text-primary">{gen.percent}</td>
                          <td className="py-3 px-4 font-bold text-emerald-600">{gen.amount}</td>
                          <td className="py-3 px-4 text-muted-foreground">{gen.teamExample} members</td>
                          <td className="py-3 px-4 font-bold text-right text-foreground">{gen.earningsExample}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ══════════════════════════════════════════════════════════════
              TAB 3: PROFILE & WALLET SYSTEM
             ══════════════════════════════════════════════════════════════ */}
          <TabsContent value="profile" className="mt-8 space-y-8">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-black">Profile, Security &amp; 3-Wallet Architecture</h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                Manage your funds securely with transparent ledger tracking, verified identity safeguards, and member healthcare privileges.
              </p>
            </div>

            {/* 3 Wallets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Deposit Wallet */}
              <Card className="rounded-2xl border border-border shadow-xs hover:border-primary/50 transition-all">
                <CardHeader>
                  <div className="h-12 w-12 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center mb-2">
                    <Wallet className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl font-bold">Deposit Wallet</CardTitle>
                  <CardDescription className="text-xs">Your self-funded transaction balance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2.5 text-xs text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                    <span>Load funds using bKash, Nagad, Rocket, or Direct Bank Transfer.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                    <span>Use to activate your ৳1,500 Premium Membership or purchase store goods.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                    <span>Instant automatic verification via transaction ID (TrxID).</span>
                  </div>
                </CardContent>
              </Card>

              {/* Bonus Wallet */}
              <Card className="rounded-2xl border-2 border-emerald-500/30 shadow-md bg-emerald-50/10 dark:bg-emerald-950/10">
                <CardHeader>
                  <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-2">
                    <DollarSign className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl font-bold">Bonus Wallet</CardTitle>
                  <CardDescription className="text-xs">Accumulated earnings &amp; rewards</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2.5 text-xs text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                    <span>Direct Sponsor Bonuses (৳225/referral) deposited immediately.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                    <span>10-Generation downline matching commissions automatically credited.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                    <span>Auto Profit Club matrix tier payouts and rank promotion cash bonuses.</span>
                  </div>
                </CardContent>
              </Card>

              {/* Withdrawal Wallet */}
              <Card className="rounded-2xl border border-border shadow-xs hover:border-primary/50 transition-all">
                <CardHeader>
                  <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-2">
                    <CreditCard className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl font-bold">Withdrawal Gateway</CardTitle>
                  <CardDescription className="text-xs">Cash out your earnings anytime</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2.5 text-xs text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>Request payouts directly to your personal bKash, Nagad, Rocket or Bank.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>Fast payout processing with complete audit trail and status alerts.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>Requires verified KYC for account safety and anti-fraud protection.</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Profile Privileges & Seba Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              {/* Digital Seba Card */}
              <Card className="rounded-2xl border border-border p-6 shadow-xs bg-gradient-to-br from-card to-muted/20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-red-500/10 text-red-600 rounded-xl">
                    <Stethoscope className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Digital Seba Health Card</h3>
                    <p className="text-xs text-muted-foreground">Medical healthcare protection for active members</p>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Every active member qualifies for the ABS Digital Seba Card. Cardholders receive free monthly online MBBS consultations, up to 50% discount on blood and diagnostic tests at partner pathology labs, and emergency helpline coverage.
                </p>
              </Card>

              {/* KYC & Identity Protection */}
              <Card className="rounded-2xl border border-border p-6 shadow-xs bg-gradient-to-br from-card to-muted/20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-primary/10 text-primary rounded-xl">
                    <UserCheck className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">KYC &amp; NID Verification</h3>
                    <p className="text-xs text-muted-foreground">Institutional-grade identity verification</p>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  To safeguard member earnings and comply with financial standards, members submit National ID (NID) photos. Once approved by administration, members enjoy instant, seamless withdrawals and permanent team ownership.
                </p>
              </Card>
            </div>
          </TabsContent>

          {/* ══════════════════════════════════════════════════════════════
              TAB 4: REWARD SYSTEM & AUTO PROFIT MATRIX
             ══════════════════════════════════════════════════════════════ */}
          <TabsContent value="reward" className="mt-8 space-y-8">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-black">Reward System &amp; Auto Profit Club</h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                Experience non-stop incentives. From our 10-Tier automated pool to international tours and luxury gifts, ABS International celebrates your every milestone.
              </p>
            </div>

            {/* Auto Profit Matrix */}
            <Card className="rounded-2xl border border-border shadow-xs overflow-hidden">
              <CardHeader className="bg-muted/40 border-b border-border/50 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <CardTitle className="text-lg font-black flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-amber-500" /> 10-Tier Auto Profit Club Matrix
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Every activation in ABS International contributes ৳52.50 into the Auto Profit pool, cycling members through 10 reward tiers.
                    </CardDescription>
                  </div>
                  <Badge className="w-fit bg-amber-500/10 text-amber-600 border-amber-500/30 font-bold font-mono">
                    ৳52.50 / Member Contribution
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {autoProfitTiers.map((tier) => (
                    <div key={tier.tier} className="p-4 rounded-xl border border-border/60 bg-muted/20 text-center hover:border-primary/40 transition-colors">
                      <Badge variant="secondary" className="text-[10px] mb-2">{tier.badge}</Badge>
                      <div className="text-base sm:text-lg font-black text-foreground font-mono">{tier.payout}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">Tier Payout</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Milestone Lifestyle Rewards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="p-5 rounded-2xl border border-border shadow-xs text-center flex flex-col items-center">
                <div className="h-12 w-12 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center mb-3">
                  <Smartphone className="h-6 w-6" />
                </div>
                <h4 className="font-bold text-sm">Smart Gadgets</h4>
                <p className="text-xs text-muted-foreground mt-1">Branded Android smartphones awarded to qualified Gold Managers.</p>
              </Card>

              <Card className="p-5 rounded-2xl border border-border shadow-xs text-center flex flex-col items-center">
                <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-3">
                  <Plane className="h-6 w-6" />
                </div>
                <h4 className="font-bold text-sm">Luxury Travel Tours</h4>
                <p className="text-xs text-muted-foreground mt-1">Fully paid Cox’s Bazar and international executive tours for Diamond &amp; Crown ranks.</p>
              </Card>

              <Card className="p-5 rounded-2xl border border-border shadow-xs text-center flex flex-col items-center">
                <div className="h-12 w-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-3">
                  <Car className="h-6 w-6" />
                </div>
                <h4 className="font-bold text-sm">Motorbike &amp; Luxury Car</h4>
                <p className="text-xs text-muted-foreground mt-1">Brand new motorbikes and executive private cars for top leadership milestones.</p>
              </Card>

              <Card className="p-5 rounded-2xl border border-border shadow-xs text-center flex flex-col items-center">
                <div className="h-12 w-12 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center mb-3">
                  <Home className="h-6 w-6" />
                </div>
                <h4 className="font-bold text-sm">1 Crore Asset Flat</h4>
                <p className="text-xs text-muted-foreground mt-1">1 Crore BDT Flat asset award and lifetime profit equity for Company Directors.</p>
              </Card>
            </div>
          </TabsContent>

          {/* ══════════════════════════════════════════════════════════════
              TAB 5: LEADERSHIP RANK SYSTEM
             ══════════════════════════════════════════════════════════════ */}
          <TabsContent value="rank" className="mt-8 space-y-8">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-black">9 Leadership Rank Progression</h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                Climb our structured leadership hierarchy by qualifying direct leaders in your 6-hand network. Each promotion unlocks immediate cash bonuses and executive honors.
              </p>
            </div>

            {/* Ranks Cards List */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {ranks.map((rank, i) => (
                <Card key={rank.id} className="rounded-2xl border border-border shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden">
                  <div>
                    <div className="p-5 border-b border-border/50 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-muted/60">{rank.icon}</div>
                        <div>
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Level {i + 1}</span>
                          <h3 className="text-base font-black text-foreground">{rank.title}</h3>
                        </div>
                      </div>
                      <Badge variant="outline" className={`text-[10px] font-bold ${rank.badgeColor}`}>
                        {rank.cashBonus !== '৳0' ? rank.cashBonus : 'Entry'}
                      </Badge>
                    </div>

                    <div className="p-5 space-y-3 text-xs">
                      <div>
                        <span className="text-muted-foreground block text-[11px] font-semibold uppercase">Qualification Criteria:</span>
                        <span className="font-bold text-foreground mt-0.5 block">{rank.req}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[11px] font-semibold uppercase">Required Active Directs:</span>
                        <span className="font-mono font-bold text-primary mt-0.5 block">{rank.downlines}</span>
                      </div>
                      <div className="pt-2 border-t border-border/40">
                        <span className="text-muted-foreground block text-[11px] font-semibold uppercase">Award &amp; Privileges:</span>
                        <span className="text-foreground font-medium mt-0.5 block">{rank.reward}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </section>

      {/* ─── Frequently Asked Questions ────────────────────────────────── */}
      <section className="container mx-auto px-4 mt-20 max-w-4xl">
        <div className="text-center mb-10">
          <Badge variant="outline" className="mb-2 px-3 py-1 text-xs font-semibold uppercase rounded-full">
            Got Questions?
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-black">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-4">
          <Card className="rounded-2xl border border-border p-5 shadow-xs">
            <h4 className="font-bold text-sm sm:text-base flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-primary shrink-0" />
              How do I activate my Premium Membership?
            </h4>
            <p className="text-xs sm:text-sm text-muted-foreground mt-2 leading-relaxed">
              After registering for free, load ৳1,500 into your Deposit Wallet via bKash, Nagad, Rocket, or Bank Transfer. Then visit your Member Dashboard &gt; Activate Account to immediately activate your membership and receive your herbal products.
            </p>
          </Card>

          <Card className="rounded-2xl border border-border p-5 shadow-xs">
            <h4 className="font-bold text-sm sm:text-base flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-primary shrink-0" />
              When do I receive my Sponsor and Generation bonuses?
            </h4>
            <p className="text-xs sm:text-sm text-muted-foreground mt-2 leading-relaxed">
              All bonuses are automated in real time. As soon as your referral or downline member activates their ৳1,500 package, your 15% Sponsor Bonus and 10-Generation commissions are instantly credited to your Bonus Wallet.
            </p>
          </Card>

          <Card className="rounded-2xl border border-border p-5 shadow-xs">
            <h4 className="font-bold text-sm sm:text-base flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-primary shrink-0" />
              What is the 6-Hand Placement rule?
            </h4>
            <p className="text-xs sm:text-sm text-muted-foreground mt-2 leading-relaxed">
              Every member has 6 direct downline positions (Hand 1 to Hand 6). Any additional member sponsored by you spills down into your team’s matrix, assisting your partners while still securing your 15% direct sponsor commission.
            </p>
          </Card>

          <Card className="rounded-2xl border border-border p-5 shadow-xs">
            <h4 className="font-bold text-sm sm:text-base flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-primary shrink-0" />
              How do I withdraw my earnings?
            </h4>
            <p className="text-xs sm:text-sm text-muted-foreground mt-2 leading-relaxed">
              Once you have submitted your NID for KYC approval, simply submit a withdrawal request from your dashboard. Funds will be sent directly to your verified bKash, Nagad, Rocket, or Bank account.
            </p>
          </Card>
        </div>
      </section>

      {/* ─── Call To Action Banner ─────────────────────────────────── */}
      <section className="container mx-auto px-4 mt-16 max-w-5xl">
        <div className="rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-primary p-8 sm:p-12 text-white text-center shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-black">
              Ready to Start Your Journey with {brandName}?
            </h3>
            <p className="text-xs sm:text-sm opacity-90 leading-relaxed">
              Register your account today, activate your ৳1,500 Premium Membership, and join thousands of empowered leaders building sustainable financial freedom.
            </p>
            <div className="pt-4 flex flex-wrap justify-center gap-3">
              <Link href="/register">
                <Button size="lg" className="rounded-full bg-white text-slate-900 hover:bg-slate-100 font-bold px-8 shadow-md">
                  Register Now
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="rounded-full border-white/40 text-white hover:bg-white/10 font-bold px-8">
                  Contact Support
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
