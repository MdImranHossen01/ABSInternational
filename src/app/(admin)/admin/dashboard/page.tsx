'use client';

import * as React from 'react';
import { useState, useEffect, useMemo, useRef } from 'react';
import {
  CartesianGrid,
  Area,
  AreaChart,
  Bar,
  BarChart,
  Pie,
  PieChart,
  RadialBar,
  RadialBarChart,
  PolarGrid,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  Cell,
  Label,
  LabelList,
} from 'recharts';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import {
  Users,
  Clock,
  Wallet,
  Loader2,
  TrendingUp,
  TrendingDown,
  Filter,
  Receipt,
  Globe,
  Zap,
  Trophy,
  Crown,
  Heart,
  Share2,
  Building2,
  AlertTriangle,
  Plane,
  Users2,
  Coins,
  ShoppingBag,
  Package,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  Award,
  Layers,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  CreditCard,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { format, subDays, parseISO, isAfter, startOfToday } from 'date-fns';
import { toast } from 'sonner';
import Swal from 'sweetalert2';

// ─── 1. Main Performance Trends Chart Config ──────────────────────────────
const performanceChartConfig = {
  revenue: {
    label: 'Total Revenue',
    color: '#8b5cf6', // Violet
  },
  profit: {
    label: 'Gross Profit',
    color: '#10b981', // Emerald
  },
  orders: {
    label: 'Sales Volume',
    color: '#f59e0b', // Amber
  },
} satisfies ChartConfig;

// ─── 2. Rank Distribution Chart Config ────────────────────────────────────
const rankChartConfig = {
  members: { label: 'Members' },
  user: { label: 'General Member', color: '#94a3b8' },
  'Premium Member': { label: 'Premium Member', color: '#3b82f6' },
  'Team Manager': { label: 'Team Manager', color: '#10b981' },
  'Royal Manager': { label: 'Royal Manager', color: '#6366f1' },
  'Silver Manager': { label: 'Silver Manager', color: '#06b6d4' },
  'Gold Manager': { label: 'Gold Manager', color: '#f59e0b' },
  'Diamond Manager': { label: 'Diamond Manager', color: '#8b5cf6' },
  'Crown Manager': { label: 'Crown Manager', color: '#f43f5e' },
  Director: { label: 'Company Director', color: '#eab308' },
} satisfies ChartConfig;

const rankColorsMap: Record<string, string> = {
  user: '#94a3b8',
  'Premium Member': '#3b82f6',
  'Team Manager': '#10b981',
  'Royal Manager': '#6366f1',
  'Silver Manager': '#06b6d4',
  'Gold Manager': '#f59e0b',
  'Diamond Manager': '#8b5cf6',
  'Crown Manager': '#f43f5e',
  Director: '#eab308',
};

// ─── 3. Inflow vs Outflow Radial Config ───────────────────────────────────
const radialFinancialConfig = {
  inflow: { label: 'Total Inflow', color: '#10b981' },
  wallets: { label: 'Wallet Reserves', color: '#3b82f6' },
  withdrawn: { label: 'Paid Out', color: '#8b5cf6' },
} satisfies ChartConfig;

// ─── 4. Wallets Horizontal Bar Config ─────────────────────────────────────
const walletBarConfig = {
  deposit: { label: 'Deposit Wallet', color: '#10b981' },
  bonus: { label: 'Bonus Wallet', color: '#f59e0b' },
  withdrawal: { label: 'Withdrawal Wallet', color: '#8b5cf6' },
} satisfies ChartConfig;

// ─── 5. Order Status Pipeline Config ──────────────────────────────────────
const orderStatusConfig = {
  delivered: { label: 'Delivered', color: '#10b981' },
  confirmed: { label: 'Confirmed / Ready', color: '#3b82f6' },
  placed: { label: 'Order Placed', color: '#f59e0b' },
  cancelled: { label: 'Cancelled', color: '#ef4444' },
} satisfies ChartConfig;

// ─── 6. MLM Fund Pools Donut Config ───────────────────────────────────────
const fundPoolChartConfig = {
  reserves: { label: 'Reserve Funds' },
  communityFund: { label: 'Community (15%)', color: '#6366f1' },
  tourFund: { label: 'Tour Fund (5%)', color: '#06b6d4' },
  autoProfit: { label: 'Auto Club (3.5%)', color: '#8b5cf6' },
  rankDevelopmentFund: { label: 'Rank Dev (2.5%)', color: '#10b981' },
  incentiveFund: { label: 'Incentive (2%)', color: '#f97316' },
  globalProfit: { label: 'Global Fund (2%)', color: '#3b82f6' },
  royaltyFund: { label: 'Royalty (2%)', color: '#eab308' },
  charityFund: { label: 'Charity (1%)', color: '#ec4899' },
} satisfies ChartConfig;

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeChart, setActiveChart] = useState<keyof typeof performanceChartConfig>('revenue');

  // MLM Fund Pool state
  const [fundPool, setFundPool] = useState<any>(null);
  const [fundLoading, setFundLoading] = useState(true);
  const [distributing, setDistributing] = useState(false);

  const fetchFundPool = async () => {
    try {
      const res = await fetch('/api/admin/mlm-funds');
      if (res.ok) setFundPool(await res.json());
    } catch {
    } finally {
      setFundLoading(false);
    }
  };

  const handleDistributeGlobalProfit = async () => {
    if (!fundPool?.globalProfit) return;

    const confirm = await Swal.fire({
      title: 'Distribute Global Profit?',
      text: `Are you sure you want to distribute ৳${(fundPool.globalProfit || 0).toLocaleString()} across all active members?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Distribute',
      cancelButtonText: 'Cancel',
      confirmButtonColor: 'var(--primary)',
    });

    if (!confirm.isConfirmed) return;

    setDistributing(true);
    try {
      const res = await fetch('/api/admin/mlm-funds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'distribute_global_profit' }),
      });
      const result = await res.json();
      if (res.ok) {
        toast.success(
          `Global Profit distributed! ৳${result.perMemberAmount} to each of ${result.activeMembers} members.`
        );
        fetchFundPool();
      } else {
        toast.error(result?.message || 'Failed to distribute global profit.');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setDistributing(false);
    }
  };

  useEffect(() => {
    fetchFundPool();
  }, []);

  // Date filter state
  const [dateRange, setDateRange] = useState({
    from: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    to: format(new Date(), 'yyyy-MM-dd'),
  });

  const [debouncedDateRange, setDebouncedDateRange] = useState(dateRange);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedDateRange(dateRange);
    }, 500);
    return () => clearTimeout(timer);
  }, [dateRange]);

  const handleDateChange = (key: 'from' | 'to', value: string) => {
    const newDate = parseISO(value);
    const today = startOfToday();

    if (isAfter(newDate, today)) {
      setDateRange((prev) => ({ ...prev, [key]: format(today, 'yyyy-MM-dd') }));
      return;
    }

    setDateRange((prev) => {
      const nextRange = { ...prev, [key]: value };
      const fromDate = parseISO(nextRange.from);
      const toDate = parseISO(nextRange.to);

      if (isAfter(fromDate, toDate)) {
        if (key === 'from') {
          return { ...nextRange, to: value };
        } else {
          return { ...nextRange, from: value };
        }
      }
      return nextRange;
    });
  };

  const setPresetRange = (days: number) => {
    setDateRange({
      from: format(subDays(new Date(), days), 'yyyy-MM-dd'),
      to: format(new Date(), 'yyyy-MM-dd'),
    });
  };

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams({
        from: debouncedDateRange.from,
        to: debouncedDateRange.to,
      }).toString();

      const response = await fetch(`/api/admin/dashboard/stats?${query}`);
      if (response.ok) {
        const stats = await response.json();
        setData(stats);
      } else {
        const errData = await response.json().catch(() => ({}));
        setError(errData.message || `Failed to fetch: ${response.status}`);
      }
    } catch (error: any) {
      console.error('Failed to fetch stats:', error);
      setError(error.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [debouncedDateRange]);

  const { stats } = data || {};

  // Performance totals
  const total = useMemo(() => {
    if (!data?.chartData) return { revenue: 0, profit: 0, orders: 0 };
    return {
      revenue: data.chartData.reduce((acc: number, curr: any) => acc + (curr.revenue || 0), 0),
      profit: data.chartData.reduce((acc: number, curr: any) => acc + (curr.profit || 0), 0),
      orders: data.chartData.reduce((acc: number, curr: any) => acc + (curr.orders || 0), 0),
    };
  }, [data]);

  const processedChartData = useMemo(() => {
    if (!data?.chartData) return [];

    const start = parseISO(dateRange.from);
    const end = parseISO(dateRange.to);
    const result = [];

    const dataMap = new Map(data.chartData.map((item: any) => [item.date, item]));

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = format(d, 'yyyy-MM-dd');
      const existing = dataMap.get(dateStr);
      if (existing) {
        result.push(existing);
      } else {
        result.push({
          date: dateStr,
          revenue: 0,
          profit: 0,
          orders: 0,
        });
      }
    }
    return result;
  }, [data, dateRange]);

  // 1. Rank Donut Chart Data
  const rankData = useMemo(() => {
    const list: any[] = stats?.rankDistribution || [];
    return list
      .filter((r) => r.count > 0)
      .map((r) => ({
        rank: r.rank,
        label: r.label,
        count: r.count,
        fill: rankColorsMap[r.rank] || '#64748b',
      }));
  }, [stats?.rankDistribution]);

  const totalMembersWithRank = useMemo(() => {
    return rankData.reduce((acc, curr) => acc + curr.count, 0) || stats?.totalUsers || 0;
  }, [rankData, stats?.totalUsers]);

  // 2. Radial Financial Inflow vs Outflow vs Reserves Data
  const radialFinancialData = useMemo(() => {
    const inflow = stats?.totalInflow || 0;
    const wallets = stats?.totalSystemWallets || 0;
    const withdrawn = stats?.completedWithdrawalAmount || 0;

    return [
      {
        category: 'inflow',
        name: 'Total Inflow',
        amount: Math.round(inflow),
        fill: '#10b981',
      },
      {
        category: 'wallets',
        name: 'Wallet Reserves',
        amount: Math.round(wallets),
        fill: '#3b82f6',
      },
      {
        category: 'withdrawn',
        name: 'Paid Out / Withdrawn',
        amount: Math.round(withdrawn),
        fill: '#8b5cf6',
      },
    ];
  }, [stats]);

  // 3. Wallets Horizontal Bar Data
  const walletHorizontalData = useMemo(() => {
    return [
      {
        wallet: 'Deposit Wallet',
        amount: Math.round(stats?.totalDepositWallet || 0),
        fill: '#10b981',
      },
      {
        wallet: 'Bonus Wallet',
        amount: Math.round(stats?.totalBonusWallet || 0),
        fill: '#f59e0b',
      },
      {
        wallet: 'Withdrawal Wallet',
        amount: Math.round(stats?.totalWithdrawalWallet || 0),
        fill: '#8b5cf6',
      },
    ];
  }, [stats]);

  // 4. Order Status Pipeline Data
  const orderPipelineData = useMemo(() => {
    const list: any[] = stats?.orderStatusDistribution || [];
    if (!list.length) {
      return [
        { status: 'Delivered', count: stats?.salesCount || 0, amount: 0, fill: '#10b981' },
        { status: 'Order Placed', count: stats?.pendingOrdersCount || 0, amount: 0, fill: '#f59e0b' },
      ];
    }
    const colorMap: Record<string, string> = {
      Delivered: '#10b981',
      'Released for Delivery': '#06b6d4',
      'Ready for Delivery': '#3b82f6',
      Paid: '#6366f1',
      Confirmed: '#3b82f6',
      'Order Placed': '#f59e0b',
      Cancelled: '#ef4444',
    };
    return list.map((item) => ({
      status: item.status,
      count: item.count,
      amount: item.totalAmount,
      fill: colorMap[item.status] || '#94a3b8',
    }));
  }, [stats]);

  // 5. Fund Pools Live Data for Visual Charts
  const fundPoolData = useMemo(() => {
    return [
      { key: 'communityFund', label: 'Community', pct: '15%', rate: '৳225', fill: '#6366f1', amount: fundPool?.communityFund ?? 0, icon: Users2, border: 'border-indigo-200/80', bg: 'bg-indigo-50/50 dark:bg-indigo-950/20', text: 'text-indigo-700 dark:text-indigo-300' },
      { key: 'tourFund', label: 'Tour Fund', pct: '5%', rate: '৳75', fill: '#06b6d4', amount: fundPool?.tourFund ?? 0, icon: Plane, border: 'border-cyan-200/80', bg: 'bg-cyan-50/50 dark:bg-cyan-950/20', text: 'text-cyan-700 dark:text-cyan-300' },
      { key: 'autoProfit', label: 'Auto Club', pct: '3.5%', rate: '৳52.5', fill: '#8b5cf6', amount: fundPool?.autoProfit ?? 0, icon: Zap, border: 'border-violet-200/80', bg: 'bg-violet-50/50 dark:bg-violet-950/20', text: 'text-violet-700 dark:text-violet-300' },
      { key: 'rankDevelopmentFund', label: 'Rank Dev', pct: '2.5%', rate: '৳37.5', fill: '#10b981', amount: fundPool?.rankDevelopmentFund ?? 0, icon: TrendingUp, border: 'border-emerald-200/80', bg: 'bg-emerald-50/50 dark:bg-emerald-950/20', text: 'text-emerald-700 dark:text-emerald-300' },
      { key: 'incentiveFund', label: 'Incentive', pct: '2%', rate: '৳30', fill: '#f97316', amount: fundPool?.incentiveFund ?? 0, icon: Trophy, border: 'border-orange-200/80', bg: 'bg-orange-50/50 dark:bg-orange-950/20', text: 'text-orange-700 dark:text-orange-300' },
      { key: 'globalProfit', label: 'Global Fund', pct: '2%', rate: '৳30', fill: '#3b82f6', amount: fundPool?.globalProfit ?? 0, icon: Globe, border: 'border-blue-200/80', bg: 'bg-blue-50/50 dark:bg-blue-950/20', text: 'text-blue-700 dark:text-blue-300' },
      { key: 'royaltyFund', label: 'Royalty', pct: '2%', rate: '৳30', fill: '#eab308', amount: fundPool?.royaltyFund ?? 0, icon: Crown, border: 'border-yellow-200/80', bg: 'bg-yellow-50/50 dark:bg-yellow-950/20', text: 'text-yellow-700 dark:text-yellow-300' },
      { key: 'charityFund', label: 'Charity', pct: '1%', rate: '৳15', fill: '#ec4899', amount: fundPool?.charityFund ?? 0, icon: Heart, border: 'border-pink-200/80', bg: 'bg-pink-50/50 dark:bg-pink-950/20', text: 'text-pink-700 dark:text-pink-300' },
    ];
  }, [fundPool]);

  const totalFundPoolReserves = useMemo(() => {
    return fundPoolData.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  }, [fundPoolData]);

  if (loading && !data) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-xs font-semibold text-muted-foreground animate-pulse">
          Loading Intelligent Dashboard Analytics...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center space-y-4">
        <div className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-8 w-8" />
          <h3 className="text-xl font-bold">Dashboard Error</h3>
        </div>
        <p className="text-muted-foreground text-sm">{error}</p>
        <Button onClick={() => fetchStats()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 py-4 md:py-6 max-w-7xl mx-auto">
      {/* ─── Top Header & Date Presets ────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-card border rounded-2xl p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black tracking-tight flex items-center gap-2">
                Executive Analytics Dashboard
              </h1>
              <p className="text-xs text-muted-foreground">
                Real-time financial inflow, MLM rank metrics, product sales & graphical analytics.
              </p>
            </div>
          </div>
        </div>

        {/* Date Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Preset Buttons */}
          <div className="inline-flex rounded-lg border bg-muted/40 p-1 text-xs">
            <button
              onClick={() => setPresetRange(7)}
              className="px-2.5 py-1 rounded-md font-medium text-muted-foreground hover:text-foreground transition-colors hover:bg-background"
            >
              7D
            </button>
            <button
              onClick={() => setPresetRange(30)}
              className="px-2.5 py-1 rounded-md font-medium text-muted-foreground hover:text-foreground transition-colors hover:bg-background"
            >
              30D
            </button>
            <button
              onClick={() => setPresetRange(90)}
              className="px-2.5 py-1 rounded-md font-medium text-muted-foreground hover:text-foreground transition-colors hover:bg-background"
            >
              90D
            </button>
          </div>

          {/* Date Picker Input */}
          <div className="flex items-center gap-1.5 bg-muted/50 p-1 rounded-lg border">
            <Filter className="h-3.5 w-3.5 text-muted-foreground ml-1.5" />
            <Input
              type="date"
              className="h-7 w-28 border-none bg-transparent focus-visible:ring-0 text-[11px] p-0 font-mono"
              value={dateRange.from}
              onChange={(e) => handleDateChange('from', e.target.value)}
              max={format(new Date(), 'yyyy-MM-dd')}
            />
            <span className="text-muted-foreground text-[10px]">to</span>
            <Input
              type="date"
              className="h-7 w-28 border-none bg-transparent focus-visible:ring-0 text-[11px] p-0 font-mono"
              value={dateRange.to}
              onChange={(e) => handleDateChange('to', e.target.value)}
              max={format(new Date(), 'yyyy-MM-dd')}
            />
          </div>

          <Button variant="outline" size="sm" onClick={fetchStats} className="h-9 px-3 gap-1.5 font-bold text-xs">
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
            Refresh
          </Button>
        </div>
      </div>

      {/* ─── 6 Core Executive KPI Cards (2 Rows × 3 Cards) ───────────────── */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {/* Card 1: Total Inflow */}
        <Card className="border border-emerald-500/20 bg-linear-to-b from-emerald-500/10 via-emerald-500/5 to-transparent relative overflow-hidden shadow-xs hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs uppercase font-bold text-emerald-800 dark:text-emerald-300 tracking-wider">
              Total Inflow
            </span>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
              <Coins className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1.5">
            <div className="text-2xl sm:text-3xl font-black text-emerald-950 dark:text-emerald-100">
              ৳{(stats?.totalInflow || 0).toLocaleString()}
            </div>
            <p className="text-[11px] text-muted-foreground leading-tight">
              Activations: <strong>৳{(stats?.packageActivationsRevenue || 0).toLocaleString()}</strong> · Deposits: <strong>৳{(stats?.completedDepositAmount || 0).toLocaleString()}</strong>
            </p>
            <div className="pt-1 flex items-center gap-1.5 text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">
              <ArrowUpRight className="h-3.5 w-3.5" />
              <span>{stats?.activeSubscribers || 0} Premium Activations + Store Sales</span>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Total Balances in Wallets */}
        <Card className="border border-blue-500/20 bg-linear-to-b from-blue-500/10 via-blue-500/5 to-transparent relative overflow-hidden shadow-xs hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs uppercase font-bold text-blue-800 dark:text-blue-300 tracking-wider">
              System Balances
            </span>
            <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600">
              <Wallet className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1.5">
            <div className="text-2xl sm:text-3xl font-black text-blue-950 dark:text-blue-100">
              ৳{(stats?.totalSystemWallets || 0).toLocaleString()}
            </div>
            <p className="text-[11px] text-muted-foreground leading-tight">
              Deposit: <strong>৳{(stats?.totalDepositWallet || 0).toLocaleString()}</strong> · Bonus: <strong>৳{Math.round(stats?.totalBonusWallet || 0).toLocaleString()}</strong>
            </p>
            <div className="pt-1 flex items-center gap-1.5 text-[10px] text-blue-700 dark:text-blue-400 font-semibold">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Withdrawable Reserve: ৳{(stats?.totalWithdrawalWallet || 0).toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Total Bonus Wallet (All Users Accumulated) */}
        <Card className="border border-amber-500/20 bg-linear-to-b from-amber-500/10 via-amber-500/5 to-transparent relative overflow-hidden shadow-xs hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs uppercase font-bold text-amber-800 dark:text-amber-300 tracking-wider">
              Total Bonus Wallet
            </span>
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600">
              <Sparkles className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1.5">
            <div className="text-2xl sm:text-3xl font-black text-amber-950 dark:text-amber-100">
              ৳{Math.round(stats?.totalBonusWallet || 0).toLocaleString()}
            </div>
            <p className="text-[11px] text-muted-foreground leading-tight">
              Accumulated earnings stored across all member bonus wallets
            </p>
            <div className="pt-1 flex items-center gap-1.5 text-[10px] text-amber-700 dark:text-amber-400 font-semibold">
              <Coins className="h-3.5 w-3.5" />
              <span>Auto-Convert Rule: ≥ ৳500 to Withdrawal Wallet</span>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Total Withdraw */}
        <Link href="/admin/withdrawals" className="block group">
          <Card className="border border-purple-500/20 bg-linear-to-b from-purple-500/10 via-purple-500/5 to-transparent relative overflow-hidden shadow-xs hover:shadow-md transition-all h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <span className="text-xs uppercase font-bold text-purple-800 dark:text-purple-300 tracking-wider">
                Total Withdraw
              </span>
              <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
                <ArrowDownLeft className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent className="space-y-1.5">
              <div className="text-2xl sm:text-3xl font-black text-purple-950 dark:text-purple-100">
                ৳{(stats?.completedWithdrawalAmount || 0).toLocaleString()}
              </div>
              <p className="text-[11px] text-muted-foreground leading-tight">
                Completed: <strong>{stats?.completedWithdrawalsCount || 0}</strong> requests successfully paid
              </p>
              <div className="pt-1 flex items-center gap-1.5 text-[10px] text-purple-700 dark:text-purple-400 font-semibold">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Paid out to members via bKash, Nagad & Banks</span>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Card 5: Pending Withdrawals */}
        <Link href="/admin/withdrawals" className="block group">
          <Card className="border border-rose-500/20 bg-linear-to-b from-rose-500/10 via-rose-500/5 to-transparent relative overflow-hidden shadow-xs hover:shadow-md transition-all h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <span className="text-xs uppercase font-bold text-rose-800 dark:text-rose-300 tracking-wider">
                Pending Withdrawals
              </span>
              <div className="h-8 w-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-600 group-hover:scale-110 transition-transform">
                <Clock className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent className="space-y-1.5">
              <div className="text-2xl sm:text-3xl font-black text-rose-950 dark:text-rose-100">
                ৳{(stats?.pendingWithdrawalAmount || 0).toLocaleString()}
              </div>
              <p className="text-[11px] text-muted-foreground leading-tight">
                <strong>{stats?.pendingWithdrawalsCount || 0}</strong> cashout requests awaiting admin approval
              </p>
              <div className="pt-1 flex items-center justify-between text-[10px]">
                <span className="text-rose-700 dark:text-rose-400 font-semibold">Review Queue:</span>
                <Badge variant="outline" className="text-[10px] bg-rose-50 text-rose-700 border-rose-300 font-bold">
                  {stats?.pendingWithdrawalsCount || 0} Pending
                </Badge>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Card 6: Product Sales & Units */}
        <Link href="/admin/orders" className="block group">
          <Card className="border border-amber-500/20 bg-linear-to-b from-amber-500/10 via-amber-500/5 to-transparent relative overflow-hidden shadow-xs hover:shadow-md transition-all h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <span className="text-xs uppercase font-bold text-amber-800 dark:text-amber-300 tracking-wider">
                Product Sales
              </span>
              <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
                <ShoppingBag className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent className="space-y-1.5">
              <div className="text-2xl sm:text-3xl font-black text-amber-950 dark:text-amber-100">
                ৳{(stats?.totalRevenue || 0).toLocaleString()}
              </div>
              <p className="text-[11px] text-muted-foreground leading-tight">
                Units Sold: <strong>{stats?.totalUnitsSold || 0} items</strong> · Gross: ৳{(stats?.grossProfit || 0).toLocaleString()}
              </p>
              <div className="pt-1 flex items-center justify-between text-[10px]">
                <span className="text-amber-700 dark:text-amber-400 font-semibold">Pending Orders:</span>
                <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-700 border-amber-300 font-bold">
                  {stats?.pendingOrdersCount || 0} orders
                </Badge>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* ─── Graphical Charts Row 1: Ranks & Capital Flow ──────────────────── */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Chart 1: Members by Rank (Pie/Donut with Center Text) */}
        <Card className="flex flex-col border shadow-xs">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Award className="h-5 w-5 text-amber-500" />
                  Members by Rank
                </CardTitle>
                <CardDescription className="text-xs">
                  Graphical member distribution across all 9 MLM ranks
                </CardDescription>
              </div>
              <Link href="/admin/users?type=ranks">
                <Button variant="ghost" size="sm" className="text-xs text-primary font-bold">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="flex-1 pb-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-4">
              {/* Donut Chart with Centered Total */}
              <ChartContainer config={rankChartConfig} className="h-[220px] w-full aspect-auto flex items-center justify-center">
                <PieChart>
                  <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                  <Pie
                    data={rankData}
                    dataKey="count"
                    nameKey="label"
                    innerRadius={55}
                    outerRadius={80}
                    strokeWidth={2}
                    paddingAngle={2}
                  >
                    {rankData.map((entry, index) => (
                      <Cell key={`rank-cell-${index}`} fill={entry.fill} />
                    ))}
                    <Label
                      content={({ viewBox }) => {
                        if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                          return (
                            <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                              <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-3xl font-black">
                                {totalMembersWithRank.toLocaleString()}
                              </tspan>
                              <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 20} className="fill-muted-foreground text-xs font-semibold">
                                Total Members
                              </tspan>
                            </text>
                          );
                        }
                      }}
                    />
                  </Pie>
                </PieChart>
              </ChartContainer>

              {/* Rank Breakdown Legend Pills */}
              <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                {(stats?.rankDistribution || []).map((item: any) => {
                  const color = rankColorsMap[item.rank] || '#94a3b8';
                  return (
                    <div
                      key={item.rank}
                      className="flex items-center justify-between text-xs p-1.5 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                        <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                          {item.label}
                        </span>
                      </div>
                      <Badge variant="secondary" className="font-mono text-xs px-2 py-0 font-bold shrink-0">
                        {item.count}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-2 border-t text-[11px] text-muted-foreground flex justify-between items-center">
            <span>Active Subscribers: <strong className="text-foreground">{stats?.activeSubscribers || 0}</strong></span>
            <span>Free Members: <strong className="text-foreground">{(stats?.totalUsers || 0) - (stats?.activeSubscribers || 0)}</strong></span>
          </CardFooter>
        </Card>

        {/* Chart 2: Capital Inflow vs Reserves vs Cashouts */}
        <Card className="flex flex-col border shadow-xs">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Coins className="h-5 w-5 text-emerald-500" />
                  Capital Inflow vs Reserves
                </CardTitle>
                <CardDescription className="text-xs">
                  Proportional comparison of incoming funds, wallet balances, and payouts
                </CardDescription>
              </div>
              <Badge variant="outline" className="border-emerald-500/30 text-emerald-700 bg-emerald-50 text-[11px] font-bold">
                Solvent
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="flex-1 pb-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-4">
              {/* Financial Flow Donut Chart */}
              <ChartContainer config={radialFinancialConfig} className="h-[220px] w-full aspect-auto flex items-center justify-center">
                <PieChart>
                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent
                        formatter={(val) => `৳${Number(val).toLocaleString()}`}
                        hideLabel
                      />
                    }
                  />
                  <Pie
                    data={radialFinancialData.filter((d) => d.amount > 0).length ? radialFinancialData.filter((d) => d.amount > 0) : [{ name: 'No Flow', amount: 1, fill: '#cbd5e1' }]}
                    dataKey="amount"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={80}
                    strokeWidth={2}
                    paddingAngle={3}
                  >
                    {(radialFinancialData.filter((d) => d.amount > 0).length ? radialFinancialData.filter((d) => d.amount > 0) : [{ name: 'No Flow', amount: 1, fill: '#cbd5e1' }]).map((entry, index) => (
                      <Cell key={`financial-cell-${index}`} fill={entry.fill} />
                    ))}
                    <Label
                      content={({ viewBox }) => {
                        if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                          return (
                            <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                              <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-2xl font-black">
                                ৳{(stats?.totalInflow || 0).toLocaleString()}
                              </tspan>
                              <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 18} className="fill-muted-foreground text-[11px] font-bold">
                                Total Inflow
                              </tspan>
                            </text>
                          );
                        }
                      }}
                    />
                  </Pie>
                </PieChart>
              </ChartContainer>

              {/* Radial Metrics Legend */}
              <div className="space-y-3">
                <div className="p-2.5 rounded-xl border bg-emerald-50/40 border-emerald-200/60 dark:bg-emerald-950/20">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" /> Total Inflow
                    </span>
                    <span className="font-mono font-black text-emerald-950 dark:text-emerald-100">
                      ৳{(stats?.totalInflow || 0).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">Activations + Product Sales + Deposits</p>
                </div>

                <div className="p-2.5 rounded-xl border bg-blue-50/40 border-blue-200/60 dark:bg-blue-950/20">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-blue-800 dark:text-blue-300 flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-blue-500" /> Wallet Reserves
                    </span>
                    <span className="font-mono font-black text-blue-950 dark:text-blue-100">
                      ৳{(stats?.totalSystemWallets || 0).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">Held safely in member wallets</p>
                </div>

                <div className="p-2.5 rounded-xl border bg-purple-50/40 border-purple-200/60 dark:bg-purple-950/20">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-purple-800 dark:text-purple-300 flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-purple-500" /> Total Paid Out
                    </span>
                    <span className="font-mono font-black text-purple-950 dark:text-purple-100">
                      ৳{(stats?.completedWithdrawalAmount || 0).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">Successfully cashed out to MFS/Banks</p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-2 border-t text-[11px] text-muted-foreground flex justify-between items-center">
            <span>Company Net Revenue: <strong className="text-emerald-600">৳{((fundPool?.totalActivations ?? stats?.activeSubscribers ?? 0) * 675).toLocaleString()}</strong></span>
            <span>Strategic Reserves: <strong className="text-primary">৳{((fundPool?.totalActivations ?? stats?.activeSubscribers ?? 0) * 495).toLocaleString()}</strong></span>
          </CardFooter>
        </Card>
      </div>

      {/* ─── Graphical Charts Row 2: Wallets Allocation & Order Pipeline ─── */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Chart 3: Wallets Horizontal Bar Chart */}
        <Card className="border shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" />
              Member Wallets Allocation
            </CardTitle>
            <CardDescription className="text-xs">
              Live balances stored in Deposit, Bonus, and Withdrawal wallets
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <ChartContainer config={walletBarConfig} className="aspect-auto h-[200px] w-full">
              <BarChart
                data={walletHorizontalData}
                layout="vertical"
                margin={{ left: 10, right: 30, top: 10, bottom: 10 }}
              >
                <XAxis type="number" hide />
                <YAxis
                  dataKey="wallet"
                  type="category"
                  tickLine={false}
                  axisLine={false}
                  className="text-xs font-semibold"
                  width={120}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      formatter={(val) => `৳${Number(val).toLocaleString()}`}
                      hideLabel
                    />
                  }
                />
                <Bar dataKey="amount" radius={6}>
                  <LabelList
                    position="right"
                    offset={10}
                    className="fill-foreground font-mono font-bold text-xs"
                    formatter={(val: any) => `৳${Number(val).toLocaleString()}`}
                  />
                  {walletHorizontalData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>

            <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t text-center">
              <div className="p-2 rounded-lg bg-emerald-500/5">
                <span className="text-[10px] text-muted-foreground uppercase font-bold block">Deposit</span>
                <span className="text-sm font-black text-emerald-700">৳{(stats?.totalDepositWallet || 0).toLocaleString()}</span>
              </div>
              <div className="p-2 rounded-lg bg-amber-500/5">
                <span className="text-[10px] text-muted-foreground uppercase font-bold block">Bonus</span>
                <span className="text-sm font-black text-amber-700">৳{Math.round(stats?.totalBonusWallet || 0).toLocaleString()}</span>
              </div>
              <div className="p-2 rounded-lg bg-purple-500/5">
                <span className="text-[10px] text-muted-foreground uppercase font-bold block">Withdrawal</span>
                <span className="text-sm font-black text-purple-700">৳{(stats?.totalWithdrawalWallet || 0).toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Chart 4: Order Status & Product Sales Pipeline */}
        <Card className="border shadow-xs">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Package className="h-5 w-5 text-amber-500" />
                  Order Pipeline & Sales Volume
                </CardTitle>
                <CardDescription className="text-xs">
                  Real-time status of orders and customer product purchases
                </CardDescription>
              </div>
              <Link href="/admin/orders">
                <Button variant="ghost" size="sm" className="text-xs text-primary font-bold">
                  View Orders
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            {orderPipelineData.every((item) => (item.count || 0) === 0) ? (
              <div className="h-[200px] flex flex-col items-center justify-center text-center p-4 rounded-xl border border-dashed bg-muted/20">
                <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600 mb-2">
                  <Package className="h-5 w-5" />
                </div>
                <p className="text-xs font-bold text-foreground">0 Orders In Selected Date Range</p>
                <p className="text-[11px] text-muted-foreground max-w-xs mt-1">
                  No product orders were placed or delivered between {debouncedDateRange.from} and {debouncedDateRange.to}.
                </p>
              </div>
            ) : (
              <ChartContainer config={orderStatusConfig} className="aspect-auto h-[200px] w-full">
                <BarChart data={orderPipelineData} margin={{ left: 10, right: 10, top: 15, bottom: 5 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
                  <XAxis
                    dataKey="status"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    className="text-[10px] font-semibold"
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dashed" />}
                  />
                  <Bar dataKey="count" radius={6} minPointSize={6}>
                    <LabelList position="top" offset={8} className="fill-foreground font-bold text-xs" />
                    {orderPipelineData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 pt-3 border-t text-center text-xs">
              <div className="p-1.5 rounded-lg bg-muted/40">
                <span className="text-[10px] text-muted-foreground block">Delivered Orders</span>
                <span className="font-bold text-emerald-600">{stats?.salesCount || 0}</span>
              </div>
              <div className="p-1.5 rounded-lg bg-muted/40">
                <span className="text-[10px] text-muted-foreground block">Pending Orders</span>
                <span className="font-bold text-amber-600">{stats?.pendingOrdersCount || 0}</span>
              </div>
              <div className="p-1.5 rounded-lg bg-muted/40">
                <span className="text-[10px] text-muted-foreground block">Units Sold</span>
                <span className="font-bold text-primary">{stats?.totalUnitsSold || 0} pcs</span>
              </div>
              <div className="p-1.5 rounded-lg bg-muted/40">
                <span className="text-[10px] text-muted-foreground block">Sales Revenue</span>
                <span className="font-bold text-foreground">৳{(stats?.totalRevenue || 0).toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ─── Chart 5: Interactive Performance Trends (The Smart Graph) ────── */}
      <Card className="border shadow-xs overflow-hidden">
        <CardHeader className="flex flex-col items-stretch border-b p-0 sm:flex-row bg-muted/10">
          <div className="flex flex-1 flex-col justify-center gap-1 px-4 py-4 md:px-6 md:py-5">
            <CardTitle className="text-lg md:text-xl font-black flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" /> Performance Trends & Analytics
            </CardTitle>
            <CardDescription className="text-xs">
              Daily trend comparison between Total Revenue, Gross Profit, and Sales Orders
            </CardDescription>
          </div>
          <div className="flex overflow-x-auto border-t sm:border-t-0 no-scrollbar divide-x bg-background/50">
            {(['revenue', 'profit', 'orders'] as const).map((key) => (
              <button
                key={key}
                data-active={activeChart === key}
                className="flex flex-1 min-w-[110px] sm:min-w-[130px] flex-col justify-center gap-1 px-4 py-3 md:px-6 md:py-4 text-left transition-colors data-[active=true]:bg-muted/70 data-[active=true]:border-b-2 data-[active=true]:border-primary"
                onClick={() => setActiveChart(key)}
              >
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  {performanceChartConfig[key].label}
                </span>
                <span className="text-base sm:text-xl font-black text-foreground">
                  {key === 'orders' ? total[key].toLocaleString() : `৳${total[key].toLocaleString()}`}
                </span>
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="px-2 pt-6 sm:px-6 sm:pt-6">
          <ChartContainer
            config={performanceChartConfig}
            className="aspect-auto h-[260px] md:h-[340px] w-full"
          >
            <AreaChart data={processedChartData} margin={{ left: 12, right: 12, top: 20, bottom: 0 }}>
              <defs>
                <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="fillProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="fillOrders" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.25} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={12}
                minTickGap={28}
                tickFormatter={(value) => format(new Date(value), 'dd MMM')}
                className="text-[11px] font-semibold"
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    className="w-[190px] shadow-lg"
                    labelFormatter={(value) => format(new Date(value), 'dd MMMM yyyy')}
                    indicator="dot"
                    formatter={(val, name) => [
                      name === 'orders' ? `${val} orders` : `৳${Number(val).toLocaleString()}`,
                      performanceChartConfig[name as keyof typeof performanceChartConfig]?.label || name,
                    ]}
                  />
                }
              />
              <ReferenceLine
                y={total[activeChart] / (processedChartData?.length || 1)}
                label={{
                  value: 'Average',
                  position: 'insideRight',
                  fill: activeChart === 'revenue' ? '#8b5cf6' : activeChart === 'profit' ? '#10b981' : '#f59e0b',
                  fontSize: 10,
                  fontWeight: 'bold',
                }}
                stroke={activeChart === 'revenue' ? '#8b5cf6' : activeChart === 'profit' ? '#10b981' : '#f59e0b'}
                strokeDasharray="3 3"
                strokeOpacity={0.6}
              />
              <Area
                dataKey="revenue"
                type="natural"
                fill="url(#fillRevenue)"
                stroke="#8b5cf6"
                strokeWidth={2.5}
                hide={activeChart !== 'revenue'}
              />
              <Area
                dataKey="profit"
                type="natural"
                fill="url(#fillProfit)"
                stroke="#10b981"
                strokeWidth={2.5}
                hide={activeChart !== 'profit'}
              />
              <Area
                dataKey="orders"
                type="natural"
                fill="url(#fillOrders)"
                stroke="#f59e0b"
                strokeWidth={2.5}
                hide={activeChart !== 'orders'}
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* ─── MLM Fund Pools Live Snapshot (With Intelligent Donut Chart) ─── */}
      <Card className="border shadow-xs overflow-hidden">
        <CardHeader className="pb-3 border-b bg-muted/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Globe className="h-5 w-5 text-indigo-600" />
                  MLM Strategic Fund Pools
                </CardTitle>
                <span className="text-[10px] font-bold bg-primary/10 text-primary px-2.5 py-0.5 rounded-full">
                  55% Total Allocation (৳825/act)
                </span>
              </div>
              <CardDescription className="text-xs mt-0.5">
                Direct Referral 15% (৳225) + Generation 7% (৳105) credited to wallets · 33% (৳495) held across 8 company reserve pools
              </CardDescription>
            </div>
            <Button
              size="sm"
              onClick={handleDistributeGlobalProfit}
              disabled={distributing || !fundPool?.globalProfit}
              className="gap-2 text-xs font-bold shrink-0 bg-primary hover:bg-primary/90 text-white shadow-xs cursor-pointer"
            >
              {distributing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Share2 className="h-3.5 w-3.5" />}
              Distribute Global Profit
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-5 pt-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
            {/* Left: Donut Chart of Reserve Funds Distribution */}
            <div className="lg:col-span-4 flex flex-col items-center justify-center p-3 rounded-2xl border bg-muted/20">
              <div className="text-center mb-1">
                <span className="text-xs font-black text-foreground block">
                  Reserve Pools Allocation
                </span>
                <span className="text-[10px] text-muted-foreground">
                  Proportional share of 33% reserve fund
                </span>
              </div>

              <ChartContainer
                config={fundPoolChartConfig}
                className="h-[210px] w-full aspect-auto flex items-center justify-center"
              >
                <PieChart>
                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent
                        formatter={(val, name, item) => [
                          `৳${Number(val).toLocaleString()} (${item.payload.pct})`,
                          name,
                        ]}
                        hideLabel
                      />
                    }
                  />
                  <Pie
                    data={fundPoolData.map((p) => ({
                      ...p,
                      visitors: p.amount > 0 ? p.amount : 1,
                    }))}
                    dataKey="visitors"
                    nameKey="label"
                    innerRadius={55}
                    outerRadius={78}
                    strokeWidth={2}
                    paddingAngle={2}
                  >
                    {fundPoolData.map((entry, index) => (
                      <Cell key={`pool-cell-${index}`} fill={entry.fill} />
                    ))}
                    <Label
                      content={({ viewBox }) => {
                        if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                          return (
                            <text
                              x={viewBox.cx}
                              y={viewBox.cy}
                              textAnchor="middle"
                              dominantBaseline="middle"
                            >
                              <tspan
                                x={viewBox.cx}
                                y={viewBox.cy}
                                className="fill-foreground text-2xl font-black"
                              >
                                ৳{Math.round(totalFundPoolReserves).toLocaleString()}
                              </tspan>
                              <tspan
                                x={viewBox.cx}
                                y={(viewBox.cy || 0) + 18}
                                className="fill-muted-foreground text-[10px] font-bold"
                              >
                                Total Reserves
                              </tspan>
                            </text>
                          );
                        }
                      }}
                    />
                  </Pie>
                </PieChart>
              </ChartContainer>

              <div className="flex flex-wrap items-center justify-center gap-1.5 text-[9px] text-muted-foreground pt-1 border-t w-full">
                <span className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" /> Community 15%
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-500" /> Tour 5%
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-violet-500" /> Auto Club 3.5%
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Rank Dev 2.5%
                </span>
              </div>
            </div>

            {/* Right: 8 Live Fund Pool Metrics Cards */}
            <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {fundPoolData.map(({ key, label, pct, rate, border, bg, text, amount, fill, icon: Icon }) => (
                <div
                  key={key}
                  className={`border ${border} ${bg} rounded-xl p-3 shadow-2xs hover:shadow-xs transition-all relative overflow-hidden`}
                >
                  <div
                    className="absolute top-0 left-0 right-0 h-1"
                    style={{ backgroundColor: fill }}
                  />
                  <div className="flex items-center justify-between mb-1.5 pt-0.5">
                    <span className={`text-[10px] font-black tracking-wide ${text}`}>{pct}</span>
                    <Icon className={`h-3.5 w-3.5 ${text}`} />
                  </div>
                  <div className={`text-base sm:text-lg font-black ${text}`}>
                    {fundLoading ? '...' : `৳${(fundPool?.[key] ?? 0).toLocaleString()}`}
                  </div>
                  <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 mt-1 truncate">
                    {label}
                  </p>
                  <p className="text-[9px] text-muted-foreground font-medium">{rate}/act</p>
                </div>
              ))}
            </div>
          </div>

          {fundPool?.totalActivations !== undefined && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-muted-foreground gap-1 bg-muted/30 border rounded-xl px-4 py-2.5">
              <p>
                Total Package Activations: <strong className="text-foreground">{fundPool.totalActivations} members</strong> (৳{(fundPool.totalActivations * 1500).toLocaleString()})
                {' · '}
                Per activation: <strong>৳825 distributed (55%)</strong> + <strong className="text-emerald-600">৳675 company net (45%)</strong>
              </p>
              {fundPool.lastUpdated && (
                <p className="text-[10px] text-muted-foreground">
                  Last updated: {new Date(fundPool.lastUpdated).toLocaleTimeString()}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ─── Recent Withdrawal History (Latest 5-10 Requests) ─────────────── */}
      <Card className="border shadow-xs overflow-hidden">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b bg-muted/10 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Receipt className="h-5 w-5 text-purple-600" />
                Recent Withdrawal History
              </CardTitle>
              <Badge variant="outline" className="text-[10px] font-bold border-purple-300 text-purple-700 bg-purple-50">
                Latest 10 Requests
              </Badge>
            </div>
            <CardDescription className="text-xs mt-0.5">
              Live payouts, MFS account numbers, community reserve deductions, and approval statuses
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/admin/withdrawals">
              <Button variant="outline" size="sm" className="h-8 text-xs font-bold gap-1.5 border-purple-300 hover:bg-purple-50 text-purple-700 dark:text-purple-300 cursor-pointer">
                <span>Withdrawal Queue</span>
                {(stats?.pendingWithdrawalsCount || 0) > 0 && (
                  <Badge className="bg-purple-600 text-white text-[10px] px-1.5 py-0 h-4">
                    {stats?.pendingWithdrawalsCount}
                  </Badge>
                )}
                <ExternalLink className="h-3.5 w-3.5 ml-0.5" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {(!data?.recentWithdrawals || data.recentWithdrawals.length === 0) ? (
            <div className="h-44 flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
              <ArrowDownLeft className="h-8 w-8 text-muted-foreground/40 mb-2" />
              <p className="text-xs font-bold text-foreground">No Withdrawal History Found</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Member withdrawal requests will appear here with full account and payout details.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/40 text-[11px] uppercase tracking-wider text-muted-foreground border-b font-bold">
                  <tr>
                    <th className="py-3 px-4">Member</th>
                    <th className="py-3 px-4">Payment Method & Account</th>
                    <th className="py-3 px-4">Gross Amount</th>
                    <th className="py-3 px-4">Community Fee (10%)</th>
                    <th className="py-3 px-4">Net Payout</th>
                    <th className="py-3 px-4">Date & Time</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {data.recentWithdrawals.map((tx: any) => {
                    const gross = tx.amount || 0;
                    const fee = Math.round(gross * 0.10 * 100) / 100;
                    const net = Math.round((gross - fee) * 100) / 100;
                    const userObj = tx.userId || {};
                    const desc = tx.description || '';

                    // Extract payment method from description or fallback
                    let method = 'MFS / Bank';
                    let account = '';
                    const methodMatch = desc.match(/to\s+([A-Za-z0-9_\-]+)\s*\(([^)]+)\)/i);
                    if (methodMatch) {
                      method = methodMatch[1].toUpperCase();
                      account = methodMatch[2];
                    } else if (desc.toLowerCase().includes('bkash')) {
                      method = 'BKASH';
                    } else if (desc.toLowerCase().includes('nagad')) {
                      method = 'NAGAD';
                    } else if (desc.toLowerCase().includes('rocket')) {
                      method = 'ROCKET';
                    }

                    return (
                      <tr key={tx._id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="h-8 w-8 rounded-full bg-purple-500/10 text-purple-700 flex items-center justify-center font-black text-xs shrink-0">
                              {(userObj.name || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-foreground truncate max-w-[140px]">
                                {userObj.name || 'Unknown User'}
                              </p>
                              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                                <span className="font-mono font-medium">{userObj.memberId || 'N/A'}</span>
                                {userObj.rank && (
                                  <>
                                    <span>·</span>
                                    <span className="text-primary font-semibold truncate max-w-[100px]">{userObj.rank}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="space-y-0.5">
                            <Badge variant="secondary" className="text-[10px] font-bold px-1.5 py-0">
                              {method}
                            </Badge>
                            {account ? (
                              <p className="font-mono text-[11px] text-slate-700 dark:text-slate-300 font-semibold">{account}</p>
                            ) : (
                              <p className="text-[10px] text-muted-foreground truncate max-w-[150px]">{desc || 'Direct Withdrawal'}</p>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-foreground">
                          ৳{gross.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 font-mono text-indigo-600 dark:text-indigo-400 font-semibold">
                          -৳{fee.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm">
                          ৳{net.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground text-[11px] whitespace-nowrap">
                          {tx.createdAt ? format(new Date(tx.createdAt), 'dd MMM yyyy, hh:mm a') : 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {tx.status === 'completed' && (
                            <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                              Paid
                            </Badge>
                          )}
                          {tx.status === 'pending' && (
                            <Badge className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 text-[10px] font-bold animate-pulse">
                              Pending
                            </Badge>
                          )}
                          {tx.status === 'failed' && (
                            <Badge className="bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20 text-[10px] font-bold">
                              Rejected
                            </Badge>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {tx.status === 'pending' ? (
                            <Link href="/admin/withdrawals">
                              <Button size="sm" variant="default" className="h-7 px-2.5 text-[11px] bg-primary hover:bg-primary/90 text-white font-bold cursor-pointer">
                                Review
                              </Button>
                            </Link>
                          ) : (
                            <Link href="/admin/withdrawals">
                              <Button size="sm" variant="ghost" className="h-7 px-2 text-[11px] text-muted-foreground hover:text-foreground cursor-pointer">
                                Details
                              </Button>
                            </Link>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
