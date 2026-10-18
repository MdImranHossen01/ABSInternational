'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
  Cell,
  Label,
  LabelList,
} from 'recharts';
import {
  Package,
  Loader2,
  TrendingUp,
  Users,
  Wallet,
  Award,
  AlertCircle,
  Coins,
  ArrowUpRight,
  ArrowDownLeft,
  Send,
  Globe,
  Trophy,
  Gift,
  Activity,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  ChevronRight,
  Layers,
  CheckCircle2,
  Clock,
  Copy,
  Check,
  Zap,
  Crown,
  Receipt,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { toast } from 'sonner';
import Swal from 'sweetalert2';
import { format } from 'date-fns';

// ─── Chart Configurations ───────────────────────────────────────────────────
const incomeStreamConfig = {
  bonus: { label: 'Bonus Amount' },
  sponsor: { label: 'Sponsor Bonus (15%)', color: '#3b82f6' },
  generation: { label: 'Generation Bonus (7%)', color: '#10b981' },
  autoprofit: { label: 'Auto Club Matrix', color: '#8b5cf6' },
  rank: { label: 'Rank Incentives', color: '#f59e0b' },
  global: { label: 'Global Profit Share', color: '#06b6d4' },
} satisfies ChartConfig;

const rankRadialConfig = {
  progress: { label: 'Rank Progress', color: '#f59e0b' },
} satisfies ChartConfig;

const userWalletBarConfig = {
  deposit: { label: 'Deposit Wallet', color: '#10b981' },
  bonus: { label: 'Bonus Wallet', color: '#f59e0b' },
  withdrawal: { label: 'Withdrawal Wallet', color: '#8b5cf6' },
} satisfies ChartConfig;

const userTrendConfig = {
  amount: { label: 'Daily Earnings', color: '#8b5cf6' },
} satisfies ChartConfig;

export default function UserDashboard() {
  const { data: session } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [fundsData, setFundsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(false);
  const [copiedField, setCopiedField] = useState<'member' | 'sponsor' | null>(null);

  const handleCopy = async (text?: string, field?: 'member' | 'sponsor') => {
    if (!text || text === 'N/A' || text === 'None') return;
    try {
      await navigator.clipboard.writeText(text);
      if (field) setCopiedField(field);
      toast.success(`${field === 'member' ? 'Member ID' : 'Sponsor ID'} copied!`);
      setTimeout(() => {
        setCopiedField(null);
      }, 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  useEffect(() => {
    async function loadData() {
      try {
        const [profileRes, fundsRes] = await Promise.all([
          fetch('/api/user/profile'),
          fetch('/api/user/funds'),
        ]);

        if (profileRes.ok) {
          const pData = await profileRes.json();
          setProfile(pData);
        }

        if (fundsRes.ok) {
          const fData = await fundsRes.json();
          setFundsData(fData);
        }
      } catch (error) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    }

    if (session?.user) {
      loadData();
    }
  }, [session]);

  const handleActivate = async () => {
    if (!profile) return;

    if (profile.nidStatus !== 'Approved') {
      Swal.fire({
        title: 'KYC Verification Required',
        html: `
          <div class="text-left space-y-2 text-sm text-gray-600">
            <p>
              ${
                profile.nidStatus === 'Pending'
                  ? 'Your National ID (KYC) verification is currently <strong>Under Review</strong> by admin. You can activate Premium Membership once your documents are approved.'
                  : 'You must complete and get your <strong>National ID (KYC)</strong> verified by admin before activating Premium Membership.'
              }
            </p>
            <p class="text-xs text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200">
              Current status: <strong>${profile.nidStatus || 'Not Submitted'}</strong>
            </p>
          </div>
        `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Go to KYC Verification',
        cancelButtonText: 'Later',
        confirmButtonColor: 'var(--primary)',
      }).then((res) => {
        if (res.isConfirmed) {
          router.push('/dashboard/profile');
        }
      });
      return;
    }

    const currentSponsor = profile.sponsorId || 'None';

    const result = await Swal.fire({
      title: 'Activate Account?',
      html: `
        <div class="text-left space-y-3">
          <p class="text-sm text-gray-600">This will purchase the Joining Package for 1,500 BDT from your Deposit Wallet. You will become a Premium Member and receive Seba health benefits.</p>
          <div class="bg-gray-50 p-3 rounded-xl border border-gray-200">
            <span class="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Assigned Sponsor ID</span>
            <span class="text-sm font-mono font-bold text-gray-900">${currentSponsor.replace(/"/g, '&quot;')}</span>
          </div>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Activate!',
      cancelButtonText: 'Cancel',
      confirmButtonColor: 'var(--primary)',
      background: 'white',
    });

    if (!result.isConfirmed) return;

    setActivating(true);
    try {
      const res = await fetch('/api/user/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sponsorId: profile.sponsorId || '' }),
      });
      const data = await res.json();

      if (res.ok) {
        Swal.fire({
          title: 'Success!',
          text: data.message,
          icon: 'success',
          confirmButtonColor: 'var(--primary)',
        });
        const [profileRes, fundsRes] = await Promise.all([
          fetch('/api/user/profile'),
          fetch('/api/user/funds'),
        ]);
        if (profileRes.ok) setProfile(await profileRes.json());
        if (fundsRes.ok) setFundsData(await fundsRes.json());
      } else {
        Swal.fire({
          title: 'Activation Failed',
          text: data.message || 'Something went wrong.',
          icon: 'error',
          confirmButtonColor: 'var(--primary)',
        });
      }
    } catch (err) {
      toast.error('Failed to connect to network');
    } finally {
      setActivating(false);
    }
  };

  const getRankProgress = () => {
    if (!profile) return 0;
    switch (profile.rank) {
      case 'user':
        return 0;
      case 'Premium Member':
        return Math.min(100, Math.round(((profile.directCount || 0) / 6) * 100));
      default:
        return Math.min(100, Math.round(((profile.directCount || 0) / 6) * 100));
    }
  };

  const getNextRank = () => {
    if (!profile) return 'Premium Member';
    switch (profile.rank) {
      case 'user':
        return 'Premium Member';
      case 'Premium Member':
        return 'Team Manager';
      case 'Team Manager':
        return 'Royal Manager';
      case 'Royal Manager':
        return 'Silver Manager';
      case 'Silver Manager':
        return 'Gold Manager';
      case 'Gold Manager':
        return 'Diamond Manager';
      case 'Diamond Manager':
        return 'Crown Manager';
      case 'Crown Manager':
        return 'Director';
      default:
        return 'Top Rank Achieved';
    }
  };

  // 1. Income Stream Donut Chart Data
  const incomeStreamData = useMemo(() => {
    const s = fundsData?.summary;
    const sponsor = s?.sponsorBonus || 0;
    const gen = s?.generationBonus || 0;
    const auto = s?.autoProfitBonus || 0;
    const rank = s?.rankBonus || 0;
    const global = s?.globalProfitBonus || 0;

    const items = [
      { name: 'Sponsor Bonus (15%)', amount: sponsor, fill: '#3b82f6' },
      { name: 'Generation Bonus (7%)', amount: gen, fill: '#10b981' },
      { name: 'Auto Club Matrix', amount: auto, fill: '#8b5cf6' },
      { name: 'Rank Incentives', amount: rank, fill: '#f59e0b' },
      { name: 'Global Profit', amount: global, fill: '#06b6d4' },
    ].filter((it) => it.amount > 0);

    if (!items.length) {
      return [{ name: 'Pending Earnings', amount: 1, fill: '#cbd5e1' }];
    }
    return items;
  }, [fundsData?.summary]);

  // 2. Rank Radial Progress Data
  const rankRadialData = useMemo(() => {
    const pct = getRankProgress();
    return [
      {
        name: 'Rank Progress',
        value: pct,
        fill: '#f59e0b',
      },
    ];
  }, [profile]);

  // 3. User Wallets Horizontal Bar Data
  const userWalletsData = useMemo(() => {
    return [
      {
        wallet: 'Deposit Wallet',
        amount: Math.round(profile?.depositWallet || 0),
        fill: '#10b981',
      },
      {
        wallet: 'Bonus Wallet',
        amount: Math.round((profile?.bonusWallet || 0) * 100) / 100,
        fill: '#f59e0b',
      },
      {
        wallet: 'Withdrawal Wallet',
        amount: Math.round(profile?.withdrawalWallet || 0),
        fill: '#8b5cf6',
      },
    ];
  }, [profile]);

  // 4. Daily Earnings 14-day Trend Data
  const dailyTrendData = useMemo(() => {
    return (fundsData?.dailyEarnings || []).map((d: any) => ({
      date: d.date,
      amount: d.amount || 0,
    }));
  }, [fundsData?.dailyEarnings]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-xs text-muted-foreground font-semibold">Loading Member Dashboard...</p>
        </div>
      </div>
    );
  }

  const globalFunds = fundsData?.globalFunds || {};
  const totalEarned = fundsData?.summary?.totalIncome || profile?.bonusWallet || 0;
  const totalBonus = fundsData?.summary?.totalBonus || profile?.bonusWallet || 0;
  const totalWithdrawn = fundsData?.summary?.completedWithdrawals || 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ─── 1. Welcome Banner ─────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-linear-to-r from-primary via-primary/90 to-emerald-800 text-white shadow-lg">
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <Badge className="bg-white/20 text-white border-0 text-[10px]">
              {profile?.isSubscriptionActive ? 'Active Member' : 'Free Member'}
            </Badge>
            <Badge className="bg-amber-400 text-amber-950 font-bold border-0 text-[10px] flex items-center gap-1">
              <Trophy className="h-3 w-3" /> {profile?.rank || 'user'}
            </Badge>
            {profile?.nidStatus === 'Approved' ? (
              <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold border-0 text-[10px] flex items-center gap-1 shadow-sm">
                <CheckCircle2 className="h-3 w-3" /> KYC Verified
              </Badge>
            ) : profile?.nidStatus === 'Pending' ? (
              <Badge className="bg-amber-400/30 text-amber-100 border border-amber-300/40 text-[10px] flex items-center gap-1">
                <Clock className="h-3 w-3" /> KYC Pending
              </Badge>
            ) : (
              <Badge className="bg-white/10 text-white/80 border border-white/20 text-[10px] flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> KYC Required
              </Badge>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black flex items-center gap-2 flex-wrap">
            <span>Welcome, {profile?.name}!</span>
            {profile?.nidStatus === 'Approved' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-white text-emerald-700 shadow-sm" title="KYC Verified Account">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                Verified
              </span>
            )}
          </h1>
          <p className="text-xs sm:text-sm opacity-90 mt-1">
            Welcome to ABS International — your trusted partner in health, beauty and wellness.
          </p>
          <div className="flex flex-wrap items-center gap-x-4 sm:gap-x-6 gap-y-2 mt-3 sm:mt-4 text-[11px] sm:text-xs font-mono bg-white/10 p-2 sm:p-2.5 px-3 rounded-lg w-full sm:w-fit border border-white/15">
            <div className="flex items-center gap-1.5">
              <span className="opacity-80">Member ID:</span>
              <span className="font-bold tracking-wide">{profile?.memberId || 'N/A'}</span>
              {profile?.memberId && (
                <button
                  type="button"
                  onClick={() => handleCopy(profile.memberId, 'member')}
                  className="p-1 hover:bg-white/20 rounded transition-colors text-white/90 hover:text-white"
                  title="Copy Member ID"
                  aria-label="Copy Member ID"
                >
                  {copiedField === 'member' ? (
                    <Check className="h-3.5 w-3.5 text-emerald-300" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <span className="opacity-80">Sponsor ID:</span>
              <span className="font-bold tracking-wide">{profile?.sponsorId || 'None'}</span>
              {profile?.sponsorId && profile.sponsorId !== 'None' && (
                <button
                  type="button"
                  onClick={() => handleCopy(profile.sponsorId, 'sponsor')}
                  className="p-1 hover:bg-white/20 rounded transition-colors text-white/90 hover:text-white"
                  title="Copy Sponsor ID"
                  aria-label="Copy Sponsor ID"
                >
                  {copiedField === 'sponsor' ? (
                    <Check className="h-3.5 w-3.5 text-emerald-300" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {!profile?.isSubscriptionActive && (
          <Button
            onClick={handleActivate}
            disabled={activating}
            className="bg-white text-primary hover:bg-white/90 font-bold h-11 sm:h-12 px-5 sm:px-7 text-xs sm:text-sm rounded-xl shrink-0 w-full md:w-auto shadow-md"
          >
            {activating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Activate Package (৳1,500)'}
          </Button>
        )}
      </div>

      {/* KYC Alert if not approved */}
      {profile?.nidStatus !== 'Approved' && (
        <Card className="border-amber-500/20 bg-amber-500/5">
          <CardContent className="p-4 sm:pt-6 flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
            <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-amber-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-bold text-xs sm:text-sm text-amber-800 dark:text-amber-300">KYC Verification Required</h4>
                <Badge variant="outline" className="border-amber-500 text-amber-700 bg-amber-500/10 capitalize text-[10px] sm:text-xs">
                  {profile?.nidStatus || 'Not Submitted'}
                </Badge>
              </div>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">Please upload your National ID (NID) cards on the profile page to enable withdrawals and system access.</p>
              <Button size="sm" variant="outline" className="mt-2.5 h-7 sm:h-8 text-xs border-amber-500/30 hover:bg-amber-500/10 text-amber-800 dark:text-amber-300" onClick={() => router.push('/dashboard/profile')}>
                Complete Verification
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ─── 2. Quick Action Buttons ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 sm:gap-3">
        <Link href="/dashboard/deposit">
          <Button variant="outline" className="w-full h-16 flex-col gap-1 border-emerald-500/30 hover:bg-emerald-500/5 text-xs font-semibold">
            <ArrowUpRight className="h-5 w-5 text-emerald-600" />
            <span>Deposit</span>
          </Button>
        </Link>
        <Link href="/dashboard/withdraw">
          <Button variant="outline" className="w-full h-16 flex-col gap-1 border-purple-500/30 hover:bg-purple-500/5 text-xs font-semibold">
            <ArrowDownLeft className="h-5 w-5 text-purple-600" />
            <span>Withdraw</span>
          </Button>
        </Link>
        <Link href="/dashboard/transfer">
          <Button variant="outline" className="w-full h-16 flex-col gap-1 border-blue-500/30 hover:bg-blue-500/5 text-xs font-semibold">
            <Send className="h-5 w-5 text-blue-600" />
            <span>Transfer</span>
          </Button>
        </Link>
        <Link href="/dashboard/tree">
          <Button variant="outline" className="w-full h-16 flex-col gap-1 border-primary/30 hover:bg-primary/5 text-xs font-semibold">
            <Users className="h-5 w-5 text-primary" />
            <span>My Tree</span>
          </Button>
        </Link>
        <Link href="/dashboard/total-bonus">
          <Button variant="outline" className="w-full h-16 flex-col gap-1 border-amber-500/30 hover:bg-amber-500/5 text-xs font-semibold">
            <Coins className="h-5 w-5 text-amber-600" />
            <span>Bonus Wallet</span>
          </Button>
        </Link>
        <Link href="/dashboard/withdraw-history">
          <Button variant="outline" className="w-full h-16 flex-col gap-1 border-indigo-500/30 hover:bg-indigo-500/5 text-xs font-semibold">
            <Activity className="h-5 w-5 text-indigo-600" />
            <span>Withdraw History</span>
          </Button>
        </Link>
      </div>

      {/* ─── 3. Financial Overview Cards ─────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Income */}
        <Link href="/dashboard/total-bonus" className="block group">
          <Card className="h-full border border-primary/20 bg-linear-to-b from-primary/5 to-transparent transition-all duration-200 group-hover:scale-[1.02] group-hover:shadow-md group-hover:border-primary/40 cursor-pointer">
            <CardHeader className="pb-1">
              <CardTitle className="text-xs uppercase text-primary font-bold tracking-wider flex items-center justify-between">
                <span>Total Income</span>
                <TrendingUp className="h-4 w-4 text-primary transition-transform group-hover:scale-110" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-black text-foreground">৳{totalEarned.toLocaleString()}</div>
              <p className="text-[10px] text-muted-foreground mt-1">Lifetime total earnings</p>
            </CardContent>
          </Card>
        </Link>

        {/* Bonus Wallet */}
        <Link href="/dashboard/total-bonus" className="block group">
          <Card className="h-full border border-amber-500/20 bg-linear-to-b from-amber-500/5 to-transparent transition-all duration-200 group-hover:scale-[1.02] group-hover:shadow-md group-hover:border-amber-500/40 cursor-pointer">
            <CardHeader className="pb-1">
              <CardTitle className="text-xs uppercase text-amber-700 dark:text-amber-400 font-bold tracking-wider flex items-center justify-between">
                <span>Bonus Wallet</span>
                <Coins className="h-4 w-4 text-amber-600 transition-transform group-hover:scale-110" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-black text-amber-950 dark:text-amber-300">৳{totalBonus.toLocaleString()}</div>
              <p className="text-[10px] text-muted-foreground mt-1">Available for auto-convert (≥ ৳500)</p>
            </CardContent>
          </Card>
        </Link>

        {/* Deposit Wallet */}
        <Link href="/dashboard/deposit" className="block group">
          <Card className="h-full border border-emerald-500/20 bg-linear-to-b from-emerald-500/5 to-transparent transition-all duration-200 group-hover:scale-[1.02] group-hover:shadow-md group-hover:border-emerald-500/40 cursor-pointer">
            <CardHeader className="pb-1">
              <CardTitle className="text-xs uppercase text-emerald-700 dark:text-emerald-400 font-bold tracking-wider flex items-center justify-between">
                <span>Deposit Wallet</span>
                <Wallet className="h-4 w-4 text-emerald-600 transition-transform group-hover:scale-110" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-black text-emerald-950 dark:text-emerald-300">৳{(profile?.depositWallet || 0).toLocaleString()}</div>
              <p className="text-[10px] text-muted-foreground mt-1">For joining & packages</p>
            </CardContent>
          </Card>
        </Link>

        {/* Withdrawal Wallet */}
        <Link href="/dashboard/withdraw" className="block group">
          <Card className="h-full border border-purple-500/20 bg-linear-to-b from-purple-500/5 to-transparent transition-all duration-200 group-hover:scale-[1.02] group-hover:shadow-md group-hover:border-purple-500/40 cursor-pointer">
            <CardHeader className="pb-1">
              <CardTitle className="text-xs uppercase text-purple-700 dark:text-purple-400 font-bold tracking-wider flex items-center justify-between">
                <span>Withdrawal Wallet</span>
                <ArrowDownLeft className="h-4 w-4 text-purple-600 transition-transform group-hover:scale-110" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-black text-purple-950 dark:text-purple-300">৳{(profile?.withdrawalWallet || 0).toLocaleString()}</div>
              <p className="text-[10px] text-muted-foreground mt-1">Cashout via bKash / Nagad / Rocket</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* ─── 4. Smart Graphical Charts Row 1: Income Stream Donut & Rank Radial ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Income Stream Breakdown (Donut Chart with Center Total) */}
        <Card className="flex flex-col border shadow-xs">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Coins className="h-5 w-5 text-primary" />
                  Income Stream Breakdown
                </CardTitle>
                <CardDescription className="text-xs">
                  Sources of earnings generated from downlines, generation matrix, and club pools
                </CardDescription>
              </div>
              <Badge variant="outline" className="border-primary/20 text-primary font-bold text-xs">
                Total: ৳{totalEarned.toLocaleString()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="flex-1 pb-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-4">
              <ChartContainer config={incomeStreamConfig} className="h-[220px] w-full aspect-auto flex items-center justify-center">
                <PieChart>
                  <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                  <Pie
                    data={incomeStreamData}
                    dataKey="amount"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={80}
                    strokeWidth={2}
                    paddingAngle={2}
                  >
                    {incomeStreamData.map((entry, index) => (
                      <Cell key={`income-cell-${index}`} fill={entry.fill} />
                    ))}
                    <Label
                      content={({ viewBox }) => {
                        if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                          return (
                            <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                              <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-2xl font-black">
                                ৳{totalEarned.toLocaleString()}
                              </tspan>
                              <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 18} className="fill-muted-foreground text-[10px] font-bold">
                                Total Income
                              </tspan>
                            </text>
                          );
                        }
                      }}
                    />
                  </Pie>
                </PieChart>
              </ChartContainer>

              {/* Bonus Breakdown Legend */}
              <div className="space-y-2">
                {[
                  { label: 'Sponsor Bonus (15%)', amount: fundsData?.summary?.sponsorBonus || 0, color: '#3b82f6' },
                  { label: 'Generation Bonus (7%)', amount: fundsData?.summary?.generationBonus || 0, color: '#10b981' },
                  { label: 'Auto Club Matrix (3.5%)', amount: fundsData?.summary?.autoProfitBonus || 0, color: '#8b5cf6' },
                  { label: 'Rank Incentives', amount: fundsData?.summary?.rankBonus || 0, color: '#f59e0b' },
                  { label: 'Global Profit Share', amount: fundsData?.summary?.globalProfitBonus || 0, color: '#06b6d4' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between text-xs p-1.5 rounded-lg hover:bg-muted/40 transition-colors">
                    <div className="flex items-center gap-2 truncate">
                      <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="font-medium text-slate-700 dark:text-slate-300 truncate">{item.label}</span>
                    </div>
                    <span className="font-mono font-bold text-foreground shrink-0">৳{item.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-2 border-t text-[11px] text-muted-foreground flex justify-between items-center">
            <span>Ready for Cashout: <strong className="text-purple-600">৳{(profile?.withdrawalWallet || 0).toLocaleString()}</strong></span>
            <span>Total Withdrawn: <strong className="text-foreground">৳{totalWithdrawn.toLocaleString()}</strong></span>
          </CardFooter>
        </Card>

        {/* Chart 2: Rank Achievement Progress (Radial Gauge) */}
        <Card className="flex flex-col border shadow-xs">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Award className="h-5 w-5 text-amber-500" />
                  My Rank & Progress
                </CardTitle>
                <CardDescription className="text-xs">
                  Unlock next rank by qualifying active direct downlines
                </CardDescription>
              </div>
              <Link href="/dashboard/rank-system">
                <Button variant="ghost" size="sm" className="text-xs text-amber-600 font-bold">
                  Rank Rules <ChevronRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="flex-1 pb-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-4">
              {/* Radial Bar Gauge */}
              <ChartContainer config={rankRadialConfig} className="h-[220px] w-full aspect-auto flex items-center justify-center">
                <RadialBarChart
                  data={rankRadialData}
                  startAngle={90}
                  endAngle={90 - Math.round(((getRankProgress() || 1) / 100) * 360)}
                  innerRadius={55}
                  outerRadius={85}
                >
                  <PolarGrid
                    gridType="circle"
                    radialLines={false}
                    stroke="none"
                    className="first:fill-muted last:fill-background"
                    polarRadius={[85, 55]}
                  />
                  <RadialBar dataKey="value" background cornerRadius={10}>
                    <Cell fill={rankRadialData[0]?.fill || '#f59e0b'} />
                  </RadialBar>
                  <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                    <Label
                      content={({ viewBox }) => {
                        if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                          return (
                            <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                              <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-3xl font-black">
                                {getRankProgress()}%
                              </tspan>
                              <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 20} className="fill-muted-foreground text-[10px] font-bold">
                                Progress
                              </tspan>
                            </text>
                          );
                        }
                      }}
                    />
                  </PolarRadiusAxis>
                </RadialBarChart>
              </ChartContainer>

              {/* Rank Target Details */}
              <div className="space-y-3">
                <div className="p-2.5 rounded-xl border bg-amber-50/50 border-amber-200/60 dark:bg-amber-950/20">
                  <span className="text-[10px] uppercase font-bold text-amber-800 dark:text-amber-400 block tracking-wider">
                    Current Rank
                  </span>
                  <div className="text-lg font-black text-amber-950 dark:text-amber-100 mt-0.5 flex items-center gap-1.5">
                    <Trophy className="h-4 w-4 text-amber-600" />
                    <span>{profile?.rank || 'user'}</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl border bg-muted/40">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Target Next Rank:</span>
                    <span className="font-black text-primary">{getNextRank()}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs mt-1.5 pt-1.5 border-t">
                    <span className="text-muted-foreground">Direct Downlines:</span>
                    <span className="font-bold">{profile?.directCount || 0} / 6 Active</span>
                  </div>
                </div>

                <div className="p-2.5 bg-emerald-50 border border-emerald-200/60 rounded-xl flex items-center justify-between text-xs">
                  <span className="text-muted-foreground font-medium">Target Reward:</span>
                  <span className="font-bold text-emerald-700 font-mono">+৳200 Cash + Seba Card</span>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-2 border-t text-[11px] text-muted-foreground flex justify-between items-center">
            <span>Direct Qualified: <strong className="text-foreground">{profile?.directCount || 0} Members</strong></span>
            <span>Needed for Manager: <strong className="text-primary">{Math.max(0, 6 - (profile?.directCount || 0))} more</strong></span>
          </CardFooter>
        </Card>
      </div>

      {/* ─── 5. Smart Graphical Charts Row 2: Wallets Allocation & 14-Day Trend ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 3: Member Wallets Allocation (Horizontal Bar) */}
        <Card className="border shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" />
              Wallets Balance Allocation
            </CardTitle>
            <CardDescription className="text-xs">
              Live balances available across Deposit, Bonus, and Withdrawal wallets
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <ChartContainer config={userWalletBarConfig} className="aspect-auto h-[190px] w-full">
              <BarChart
                data={userWalletsData}
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
                  {userWalletsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>

            <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t text-center text-xs">
              <Link href="/dashboard/deposit" className="p-2 rounded-lg bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors">
                <span className="text-[10px] text-muted-foreground uppercase font-bold block">Deposit</span>
                <span className="text-sm font-black text-emerald-700">৳{(profile?.depositWallet || 0).toLocaleString()}</span>
              </Link>
              <Link href="/dashboard/total-bonus" className="p-2 rounded-lg bg-amber-500/5 hover:bg-amber-500/10 transition-colors">
                <span className="text-[10px] text-muted-foreground uppercase font-bold block">Bonus</span>
                <span className="text-sm font-black text-amber-700">৳{totalBonus.toLocaleString()}</span>
              </Link>
              <Link href="/dashboard/withdraw" className="p-2 rounded-lg bg-purple-500/5 hover:bg-purple-500/10 transition-colors">
                <span className="text-[10px] text-muted-foreground uppercase font-bold block">Withdrawal</span>
                <span className="text-sm font-black text-purple-700">৳{(profile?.withdrawalWallet || 0).toLocaleString()}</span>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Chart 4: Daily Earnings 14-Day Area Trend */}
        <Card className="border shadow-xs">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Activity className="h-5 w-5 text-purple-600" />
                  Daily Earnings Trend
                </CardTitle>
                <CardDescription className="text-xs">
                  Daily incoming commissions and bonus growth
                </CardDescription>
              </div>
              <Badge variant="outline" className="border-purple-300 text-purple-700 bg-purple-50 text-[10px] font-bold">
                Last 14 Days
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <ChartContainer config={userTrendConfig} className="aspect-auto h-[190px] w-full">
              <AreaChart data={dailyTrendData} margin={{ left: 10, right: 10, top: 15, bottom: 5 }}>
                <defs>
                  <linearGradient id="fillUserTrend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.25} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(val) => {
                    try {
                      return format(new Date(val), 'dd MMM');
                    } catch {
                      return val;
                    }
                  }}
                  className="text-[10px] font-semibold"
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      indicator="dot"
                      formatter={(val) => `৳${Number(val).toLocaleString()}`}
                    />
                  }
                />
                <Area
                  dataKey="amount"
                  type="natural"
                  fill="url(#fillUserTrend)"
                  stroke="#8b5cf6"
                  strokeWidth={2.5}
                />
              </AreaChart>
            </ChartContainer>

            <div className="flex items-center justify-between text-xs mt-4 pt-3 border-t text-muted-foreground">
              <span>Lifetime Income: <strong className="text-foreground">৳{totalEarned.toLocaleString()}</strong></span>
              <Link href="/dashboard/transaction-statement" className="text-primary font-bold hover:underline flex items-center gap-1">
                Statement <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ─── 6. Team Performance ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6">
        <Card className="border shadow-xs">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" /> Team Performance
                </CardTitle>
                <CardDescription>Track downline volume, direct members and overall team sales</CardDescription>
              </div>
              <Link href="/dashboard/tree">
                <Button variant="ghost" size="sm" className="text-xs text-primary font-bold">
                  View Tree <ChevronRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-3">
            <div className="p-3.5 bg-muted/40 rounded-xl text-center">
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Downlines</span>
              <span className="text-xl sm:text-2xl font-black text-foreground mt-1 block">
                {profile?.teamCount || 0}
              </span>
              <span className="text-[10px] text-emerald-600 font-semibold">Total Network Members</span>
            </div>

            <div className="p-3.5 bg-muted/40 rounded-xl text-center">
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Personal Sales</span>
              <span className="text-xl sm:text-2xl font-black text-foreground mt-1 block">
                ৳{profile?.personalSales || 0}
              </span>
              <span className="text-[10px] text-primary font-semibold">Own PV / Purchases</span>
            </div>

            <div className="p-3.5 bg-muted/40 rounded-xl text-center">
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Team Sales</span>
              <span className="text-xl sm:text-2xl font-black text-foreground mt-1 block">
                ৳{profile?.teamSales || 0}
              </span>
              <span className="text-[10px] text-blue-600 font-semibold">Group Volume Sales</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ─── 7. Global Fund Pools Live Snapshot ──────────────────────────── */}
      <Card className="border shadow-xs">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Globe className="h-5 w-5 text-teal-600" />
                Global Fund Pools Live Snapshot
              </CardTitle>
              <CardDescription>
                Live balance allocated from company package activations to the designated community funds
              </CardDescription>
            </div>
            <Link href="/dashboard/global-profit">
              <Button variant="outline" size="sm" className="text-xs border-teal-500/30 text-teal-700 font-bold">
                View Funds Breakdown <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <div className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/20">
              <span className="text-[10px] font-bold uppercase text-purple-700 dark:text-purple-400 block">Global Profit</span>
              <span className="text-lg font-black text-purple-950 dark:text-purple-300 mt-1 block">
                ৳{(globalFunds.globalProfit || 0).toLocaleString()}
              </span>
              <span className="text-[9px] text-muted-foreground">Shared to all active members</span>
            </div>

            <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
              <span className="text-[10px] font-bold uppercase text-amber-700 dark:text-amber-400 block">Incentive Fund</span>
              <span className="text-lg font-black text-amber-950 dark:text-amber-300 mt-1 block">
                ৳{(globalFunds.incentiveFund || 0).toLocaleString()}
              </span>
              <span className="text-[9px] text-muted-foreground">Gadgets, phones & tours</span>
            </div>

            <div className="p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/20">
              <span className="text-[10px] font-bold uppercase text-cyan-700 dark:text-cyan-400 block">Rank Dev Fund</span>
              <span className="text-lg font-black text-cyan-950 dark:text-cyan-300 mt-1 block">
                ৳{(globalFunds.rankDevelopmentFund || 0).toLocaleString()}
              </span>
              <span className="text-[9px] text-muted-foreground">Rank upgrade cash rewards</span>
            </div>

            <div className="p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/20">
              <span className="text-[10px] font-bold uppercase text-indigo-700 dark:text-indigo-400 block">Royalty Fund</span>
              <span className="text-lg font-black text-indigo-950 dark:text-indigo-300 mt-1 block">
                ৳{(globalFunds.royaltyFund || 0).toLocaleString()}
              </span>
              <span className="text-[9px] text-muted-foreground">Diamond+ royalties & cars</span>
            </div>

            <div className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/20 col-span-2 sm:col-span-1">
              <span className="text-[10px] font-bold uppercase text-rose-700 dark:text-rose-400 block">Charity Fund</span>
              <span className="text-lg font-black text-rose-950 dark:text-rose-300 mt-1 block">
                ৳{(globalFunds.charityFund || 0).toLocaleString()}
              </span>
              <span className="text-[9px] text-muted-foreground">1% social welfare allocation</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ─── 8. Recent Withdrawal History ─────────────────────────────────── */}
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
              Your recent cashout requests, payment gateways, community fee deductions, and current status
            </CardDescription>
          </div>
          <Link href="/dashboard/withdraw-history">
            <Button variant="outline" size="sm" className="h-8 text-xs font-bold gap-1.5 border-purple-300 hover:bg-purple-50 text-purple-700 dark:text-purple-300">
              <span>View Full History</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          {(!fundsData?.recentWithdrawals || fundsData.recentWithdrawals.length === 0) ? (
            <div className="h-40 flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
              <ArrowDownLeft className="h-8 w-8 text-muted-foreground/40 mb-2" />
              <p className="text-xs font-bold text-foreground">No Withdrawal Records Yet</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                When you submit a withdrawal from your Withdrawal Wallet, your payout details will show here.
              </p>
              <Link href="/dashboard/withdraw" className="mt-3">
                <Button size="sm" className="h-7 text-xs bg-primary text-white font-semibold">
                  Request Cashout
                </Button>
              </Link>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/40 text-[11px] uppercase tracking-wider text-muted-foreground border-b font-bold">
                    <tr>
                      <th className="py-3 px-4">Gateway & Details</th>
                      <th className="py-3 px-4">Gross Requested</th>
                      <th className="py-3 px-4">Community Fee (10%)</th>
                      <th className="py-3 px-4">Net Payout</th>
                      <th className="py-3 px-4">Date & Time</th>
                      <th className="py-3 px-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {fundsData.recentWithdrawals.map((tx: any) => {
                      const gross = tx.amount || 0;
                      const fee = Math.round(gross * 0.10 * 100) / 100;
                      const net = Math.round((gross - fee) * 100) / 100;
                      const desc = tx.description || '';

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
                            <div className="space-y-0.5">
                              <Badge variant="secondary" className="text-[10px] font-bold px-1.5 py-0">
                                {method}
                              </Badge>
                              {account ? (
                                <p className="font-mono text-[11px] text-slate-700 dark:text-slate-300 font-semibold">{account}</p>
                              ) : (
                                <p className="text-[10px] text-muted-foreground truncate max-w-[200px]">{desc || 'Withdrawal'}</p>
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
                            {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'}
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
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards View */}
              <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
                {fundsData.recentWithdrawals.map((tx: any) => {
                  const gross = tx.amount || 0;
                  const fee = Math.round(gross * 0.10 * 100) / 100;
                  const net = Math.round((gross - fee) * 100) / 100;
                  const desc = tx.description || '';

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
                    <div key={tx._id} className="p-4 space-y-3 bg-white dark:bg-slate-900/60 hover:bg-slate-50/50 transition-colors">
                      {/* Top: Gateway & Status */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <Badge variant="secondary" className="text-[10px] font-bold px-2 py-0.5 shrink-0">
                            {method}
                          </Badge>
                          {account ? (
                            <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{account}</span>
                          ) : (
                            <span className="text-[11px] text-muted-foreground truncate">{desc || 'Withdrawal'}</span>
                          )}
                        </div>
                        <div className="shrink-0">
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
                        </div>
                      </div>

                      {/* Financial Breakdown Grid */}
                      <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                        <div>
                          <span className="text-[10px] text-muted-foreground uppercase font-bold block">Gross</span>
                          <span className="font-mono font-bold text-xs text-foreground">৳{gross.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-muted-foreground uppercase font-bold block">Fee (10%)</span>
                          <span className="font-mono font-semibold text-xs text-indigo-600 dark:text-indigo-400">-৳{fee.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-muted-foreground uppercase font-bold block">Net Payout</span>
                          <span className="font-mono font-black text-sm text-emerald-600 dark:text-emerald-400">৳{net.toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Footer: Date */}
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-0.5">
                        <span className="flex items-center gap-1.5 font-medium">
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                          {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
