'use client';

import * as React from 'react';
import { useState, useEffect, useMemo } from 'react';
import { CartesianGrid, Area, AreaChart, XAxis, ResponsiveContainer, Tooltip, ReferenceLine } from "recharts";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from '@/components/ui/card';
import { 
  Users, 
  Clock, 
  Wallet,
  Loader2,
  TrendingUp,
  Filter,
  Receipt,
  Globe,
  Zap,
  Trophy,
  Crown,
  Heart,
  Share2,
  Building2,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { format, subDays, parseISO, isAfter, startOfToday } from 'date-fns';
import { toast } from 'sonner';
import Swal from 'sweetalert2';

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "var(--primary)",
  },
  profit: {
    label: "Gross Profit",
    color: "var(--chart-2)",
  },
  orders: {
    label: "Total Sales",
    color: "#fb923c",
  },
} satisfies ChartConfig;

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeChart, setActiveChart] = useState<keyof typeof chartConfig>("revenue");

  // MLM Fund Pool state
  const [fundPool, setFundPool] = useState<any>(null);
  const [fundLoading, setFundLoading] = useState(true);
  const [distributing, setDistributing] = useState(false);

  const fetchFundPool = async () => {
    try {
      const res = await fetch('/api/admin/mlm-funds');
      if (res.ok) setFundPool(await res.json());
    } catch {}
    finally { setFundLoading(false); }
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
        toast.success(`Global Profit distributed! ৳${result.perMemberAmount} to each of ${result.activeMembers} members.`);
        fetchFundPool();
      } else {
        toast.error(result?.message || 'Failed to distribute global profit.');
      }
    } catch { toast.error('Network error'); }
    finally { setDistributing(false); }
  };

  useEffect(() => { fetchFundPool(); }, []);
  
  // Date filter state
  const [dateRange, setDateRange] = useState({
    from: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    to: format(new Date(), 'yyyy-MM-dd'),
  });

  const [debouncedDateRange, setDebouncedDateRange] = useState(dateRange);

  // Debounce date range changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedDateRange(dateRange);
    }, 500);
    return () => clearTimeout(timer);
  }, [dateRange]);

  const handleDateChange = (key: 'from' | 'to', value: string) => {
    const newDate = parseISO(value);
    const today = startOfToday();
    
    // Block future dates
    if (isAfter(newDate, today)) {
      setDateRange(prev => ({ ...prev, [key]: format(today, 'yyyy-MM-dd') }));
      return;
    }

    setDateRange(prev => {
      const nextRange = { ...prev, [key]: value };
      const fromDate = parseISO(nextRange.from);
      const toDate = parseISO(nextRange.to);

      // Ensure from <= to
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

  const total = useMemo(() => {
    if (!data?.chartData) return { revenue: 0, profit: 0, orders: 0 };
    return {
      revenue: data.chartData.reduce((acc: number, curr: any) => acc + curr.revenue, 0),
      profit: data.chartData.reduce((acc: number, curr: any) => acc + curr.profit, 0),
      orders: data.chartData.reduce((acc: number, curr: any) => acc + curr.orders, 0),
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
          orders: 0
        });
      }
    }
    return result;
  }, [data, dateRange]);

  if (loading && !data) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={() => fetchStats()}>Retry</Button>
      </div>
    );
  }

  const { stats } = data || {};

  return (
    <div className="flex-1 space-y-6 px-0 py-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard Overview</h2>
          <p className="text-muted-foreground text-xs md:text-sm">Advanced business intelligence and sales analytics.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-lg border w-full sm:w-auto">
            <div className="flex items-center gap-1 px-2 shrink-0">
              <Filter className="h-3 w-3 text-muted-foreground" />
              <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Range</span>
            </div>
            <div className="flex items-center gap-1 flex-1 sm:flex-initial">
              <Input 
                type="date" 
                className="h-8 w-full sm:w-32 border-none bg-transparent focus-visible:ring-0 cursor-pointer text-xs p-1" 
                value={dateRange.from}
                onChange={(e) => handleDateChange('from', e.target.value)}
                max={format(new Date(), 'yyyy-MM-dd')}
              />
              <span className="text-muted-foreground text-[10px] shrink-0">to</span>
              <Input 
                type="date" 
                className="h-8 w-full sm:w-32 border-none bg-transparent focus-visible:ring-0 cursor-pointer text-xs p-1" 
                value={dateRange.to}
                onChange={(e) => handleDateChange('to', e.target.value)}
                max={format(new Date(), 'yyyy-MM-dd')}
              />
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={fetchStats} className="h-10 px-4 w-full sm:w-auto font-bold">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Refresh'}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Pending Orders Card */}
        <Link href="/admin/orders" className="block transition-transform hover:scale-[1.02] active:scale-95">
          <Card className="bg-orange-500/5 border-orange-500/20 relative overflow-hidden group h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-700">{stats?.pendingOrdersCount || 0}</div>
              <p className="text-xs text-muted-foreground">Requires attention</p>
            </CardContent>
          </Card>
        </Link>

        {/* Total Customers Card */}
        <Link href="/admin/users" className="block transition-transform hover:scale-[1.02] active:scale-95">
          <Card className="bg-blue-500/5 border-blue-500/20 relative overflow-hidden group h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Members</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700">{stats?.totalUsers || 0}</div>
              <p className="text-xs text-muted-foreground">Across all time</p>
            </CardContent>
          </Card>
        </Link>

        {/* Pending Withdrawals Card */}
        <Link href="/admin/withdrawals" className="block transition-transform hover:scale-[1.02] active:scale-95">
          <Card className="bg-purple-500/5 border-purple-500/20 relative overflow-hidden group h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Withdrawals</CardTitle>
              <Wallet className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-700">{stats?.pendingWithdrawalsCount || 0}</div>
              <p className="text-xs text-muted-foreground">Payouts to approve</p>
            </CardContent>
          </Card>
        </Link>

        {/* Pending KYC / NID Card */}
        <Link href="/admin/kyc" className="block transition-transform hover:scale-[1.02] active:scale-95">
          <Card className="bg-orange-500/5 border-orange-500/20 relative overflow-hidden group h-full border-dashed">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending KYC (NID)</CardTitle>
              <Receipt className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-700">{stats?.pendingKycCount || 0}</div>
              <p className="text-xs text-muted-foreground">Pending verifications</p>
            </CardContent>
          </Card>
        </Link>

        {/* Company Net Revenue Card */}
        <Card className="bg-emerald-500/5 border-emerald-500/20 relative overflow-hidden group h-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Company Net Revenue</CardTitle>
            <Building2 className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-700">
              {fundLoading
                ? '...'
                : `৳${((fundPool?.totalActivations ?? 0) * 983).toLocaleString()}`
              }
            </div>
            <p className="text-xs text-muted-foreground">
              {fundLoading ? '' : `${fundPool?.totalActivations ?? 0} activation${(fundPool?.totalActivations ?? 0) !== 1 ? 's' : ''} × ৳983`}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ── MLM Fund Pool Widget ─────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-lg font-bold">MLM Fund Pools</h3>
            <p className="text-xs text-muted-foreground">Accumulated from each 1,500 BDT activation package</p>
          </div>
          <Button
            size="sm"
            onClick={handleDistributeGlobalProfit}
            disabled={distributing || !fundPool?.globalProfit}
            className="gap-2 text-xs font-bold"
          >
            {distributing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Share2 className="h-3 w-3" />}
            Distribute Global Profit
          </Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { key: 'autoProfit',          label: 'Auto Profit',         pct: '3.5%', color: 'bg-violet-50 border-violet-200 text-violet-700', icon: Zap },
            { key: 'globalProfit',        label: 'Global Profit',       pct: '2%',   color: 'bg-blue-50 border-blue-200 text-blue-700',     icon: Globe },
            { key: 'incentiveFund',       label: 'Incentive Fund',      pct: '2%',   color: 'bg-orange-50 border-orange-200 text-orange-700', icon: Trophy },
            { key: 'rankDevelopmentFund', label: 'Rank Dev Fund',       pct: '2%',   color: 'bg-green-50 border-green-200 text-green-700',   icon: TrendingUp },
            { key: 'royaltyFund',         label: 'Royalty Fund',        pct: '2%',   color: 'bg-yellow-50 border-yellow-200 text-yellow-700', icon: Crown },
            { key: 'charityFund',         label: 'Charity Fund',        pct: '1%',   color: 'bg-pink-50 border-pink-200 text-pink-700',      icon: Heart },
          ].map(({ key, label, pct, color, icon: Icon }) => (
            <Card key={key} className={`border ${color.split(' ')[1]} overflow-hidden`}>
              <CardContent className={`p-4 ${color.split(' ')[0]}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wide ${color.split(' ')[2]}`}>{pct}</span>
                  <Icon className={`h-4 w-4 ${color.split(' ')[2]}`} />
                </div>
                <div className={`text-xl font-black ${color.split(' ')[2]}`}>
                  {fundLoading ? '...' : `৳${(fundPool?.[key] ?? 0).toLocaleString()}`}
                </div>
                <p className="text-[11px] font-medium text-muted-foreground mt-1">{label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        {fundPool?.totalActivations !== undefined && (
          <p className="text-[11px] text-muted-foreground mt-2">
            Total activations: <strong>{fundPool.totalActivations}</strong>
            {' · '}
            Per activation: ৳517 distributed (34.5%) + <strong className="text-emerald-600">৳983 company (65.5%)</strong>
            {fundPool.lastUpdated && ` · Last updated: ${new Date(fundPool.lastUpdated).toLocaleString()}`}
          </p>
        )}
      </div>

      <div className="grid gap-4 grid-cols-1">
        {/* Interactive Chart */}
        <Card className="col-span-full">
          <CardHeader className="flex flex-col items-stretch border-b p-0 sm:flex-row">
            <div className="flex flex-1 flex-col justify-center gap-1 px-4 py-4 md:px-6 md:py-6">
              <CardTitle className="text-lg md:text-xl">Performance Trends</CardTitle>
              <CardDescription className="text-xs md:text-sm">
                Comparison between Revenue and Gross Profit
              </CardDescription>
            </div>
            <div className="flex overflow-x-auto border-t sm:border-t-0 no-scrollbar">
              {(["revenue", "profit", "orders"] as const).map((key) => (
                <button
                  key={key}
                  data-active={activeChart === key}
                  className="flex flex-1 min-w-[100px] sm:min-w-[120px] flex-col justify-center gap-1 border-r last:border-r-0 px-4 py-3 md:px-8 md:py-6 text-left data-[active=true]:bg-muted/50 sm:border-l sm:border-r-0"
                  onClick={() => setActiveChart(key)}
                >
                  <span className="text-[10px] md:text-xs text-muted-foreground whitespace-nowrap">
                    {chartConfig[key].label}
                  </span>
                  <span className="text-base md:text-2xl leading-none font-bold">
                    {key === 'orders' ? total[key].toLocaleString() : `৳${total[key].toLocaleString()}`}
                  </span>
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="px-1 pt-4 sm:px-6 sm:pt-6">
            <ChartContainer
              config={chartConfig}
              className="aspect-auto h-[250px] md:h-[350px] w-full"
            >
              <AreaChart data={processedChartData} margin={{ left: 12, right: 12, top: 20, bottom: 0 }}>
                <defs>
                  <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-revenue)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-revenue)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                  <linearGradient id="fillProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-profit)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-profit)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                  <linearGradient id="fillOrders" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-orders)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-orders)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.2} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={12}
                  minTickGap={32}
                  tickFormatter={(value) => format(new Date(value), 'dd MMM')}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      className="w-[180px]"
                      labelFormatter={(value) => format(new Date(value), 'dd MMMM yyyy')}
                      indicator="dot"
                    />
                  }
                />
                {/* Reference Line for Average */}
                <ReferenceLine 
                  y={total[activeChart] / (processedChartData?.length || 1)} 
                  label={{ value: 'Avg', position: 'insideRight', fill: activeChart === "revenue" ? 'var(--primary)' : 'var(--chart-2)', fontSize: 10 }}
                  stroke={activeChart === "revenue" ? "var(--primary)" : "var(--chart-2)"} 
                  strokeDasharray="3 3" 
                  strokeOpacity={0.5}
                />
                <Area
                  dataKey="revenue"
                  type="natural"
                  fill="url(#fillRevenue)"
                  stroke="var(--color-revenue)"
                  strokeWidth={2}
                  hide={activeChart !== "revenue"}
                />
                <Area
                  dataKey="profit"
                  type="natural"
                  fill="url(#fillProfit)"
                  stroke="var(--color-profit)"
                  strokeWidth={2}
                  hide={activeChart !== "profit"}
                />
                <Area
                  dataKey="orders"
                  type="natural"
                  fill="url(#fillOrders)"
                  stroke="var(--color-orders)"
                  strokeWidth={2}
                  hide={activeChart !== "orders"}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

