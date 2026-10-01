'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import Swal from 'sweetalert2';

export default function UserDashboard() {
  const { data: session } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [fundsData, setFundsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(false);

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
        body: JSON.stringify({ sponsorId: profile.sponsorId || '' })
      });
      const data = await res.json();

      if (res.ok) {
        Swal.fire({
          title: 'Success!',
          text: data.message,
          icon: 'success',
          confirmButtonColor: 'var(--primary)'
        });
        // Reload details
        const [profileRes, fundsRes] = await Promise.all([
          fetch('/api/user/profile'),
          fetch('/api/user/funds')
        ]);
        if (profileRes.ok) setProfile(await profileRes.json());
        if (fundsRes.ok) setFundsData(await fundsRes.json());
      } else {
        Swal.fire({
          title: 'Activation Failed',
          text: data.message || 'Something went wrong.',
          icon: 'error',
          confirmButtonColor: 'var(--primary)'
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
      case 'user': return 0;
      case 'Premium Member': return Math.min(100, Math.round(((profile.directCount || 0) / 6) * 100));
      default: return Math.min(100, Math.round(((profile.directCount || 0) / 6) * 100));
    }
  };

  const getNextRank = () => {
    if (!profile) return 'Premium Member';
    switch (profile.rank) {
      case 'user': return 'Premium Member';
      case 'Premium Member': return 'Team Manager';
      case 'Team Manager': return 'Royal Manager';
      case 'Royal Manager': return 'Silver Manager';
      case 'Silver Manager': return 'Gold Manager';
      case 'Gold Manager': return 'Diamond Manager';
      case 'Diamond Manager': return 'Crown Manager';
      case 'Crown Manager': return 'Director';
      default: return 'Top Rank Achieved';
    }
  };

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

  return (
    <div className="space-y-6">
      {/* 1. Welcome Banner */}
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
          <div className="flex flex-wrap gap-x-4 sm:gap-x-6 gap-y-1 sm:gap-y-2 mt-3 sm:mt-4 text-[11px] sm:text-xs font-mono bg-white/10 p-2.5 sm:p-3 rounded-lg w-full sm:w-fit border border-white/15">
            <div>Member ID: <span className="font-bold">{profile?.memberId || 'N/A'}</span></div>
            <div>Sponsor ID: <span className="font-bold">{profile?.sponsorId || 'None'}</span></div>
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

      {/* Quick Action Buttons */}
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
        <Link href="/dashboard/generation-bonus">
          <Button variant="outline" className="w-full h-16 flex-col gap-1 border-amber-500/30 hover:bg-amber-500/5 text-xs font-semibold">
            <Coins className="h-5 w-5 text-amber-600" />
            <span>Generation Bonus</span>
          </Button>
        </Link>
        <Link href="/dashboard/rank-reward">
          <Button variant="outline" className="w-full h-16 flex-col gap-1 border-rose-500/30 hover:bg-rose-500/5 text-xs font-semibold">
            <Trophy className="h-5 w-5 text-rose-600" />
            <span>Rank Rewards</span>
          </Button>
        </Link>
      </div>

      {/* Financial Wallets & Income Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Income */}
        <Card className="border border-primary/20 bg-linear-to-b from-primary/5 to-transparent">
          <CardHeader className="pb-1">
            <CardTitle className="text-xs uppercase text-primary font-bold tracking-wider flex items-center justify-between">
              <span>Total Income</span>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-black text-foreground">৳{totalEarned.toLocaleString()}</div>
            <p className="text-[10px] text-muted-foreground mt-1">Lifetime total earnings</p>
          </CardContent>
        </Card>

        {/* Total Bonus */}
        <Card className="border border-blue-500/20 bg-linear-to-b from-blue-500/5 to-transparent">
          <CardHeader className="pb-1">
            <CardTitle className="text-xs uppercase text-blue-700 dark:text-blue-400 font-bold tracking-wider flex items-center justify-between">
              <span>Total Bonus</span>
              <Coins className="h-4 w-4 text-blue-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-black text-blue-900 dark:text-blue-300">৳{totalBonus.toLocaleString()}</div>
            <p className="text-[10px] text-muted-foreground mt-1">Available in bonus wallet</p>
          </CardContent>
        </Card>

        {/* Deposit Wallet */}
        <Card className="border border-emerald-500/20 bg-linear-to-b from-emerald-500/5 to-transparent">
          <CardHeader className="pb-1">
            <CardTitle className="text-xs uppercase text-emerald-700 dark:text-emerald-400 font-bold tracking-wider flex items-center justify-between">
              <span>Deposit Wallet</span>
              <Wallet className="h-4 w-4 text-emerald-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-black text-emerald-950 dark:text-emerald-300">৳{(profile?.depositWallet || 0).toLocaleString()}</div>
            <p className="text-[10px] text-muted-foreground mt-1">For joining & packages</p>
          </CardContent>
        </Card>

        {/* Available Bonus Wallet */}
        <Card className="border border-amber-500/20 bg-linear-to-b from-amber-500/5 to-transparent">
          <CardHeader className="pb-1">
            <CardTitle className="text-xs uppercase text-amber-700 dark:text-amber-400 font-bold tracking-wider flex items-center justify-between">
              <span>Bonus Wallet</span>
              <Award className="h-4 w-4 text-amber-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-black text-amber-950 dark:text-amber-300">৳{(profile?.bonusWallet || 0).toLocaleString()}</div>
            <p className="text-[10px] text-muted-foreground mt-1">Ready for withdrawal/transfer</p>
          </CardContent>
        </Card>

        {/* Withdrawal Wallet */}
        <Card className="border border-purple-500/20 bg-linear-to-b from-purple-500/5 to-transparent">
          <CardHeader className="pb-1">
            <CardTitle className="text-xs uppercase text-purple-700 dark:text-purple-400 font-bold tracking-wider flex items-center justify-between">
              <span>Withdrawal Wallet</span>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-black text-purple-950 dark:text-purple-300">৳{(profile?.withdrawalWallet || 0).toLocaleString()}</div>
            <p className="text-[10px] text-muted-foreground mt-1">Bank / bKash / Nagad</p>
          </CardContent>
        </Card>
      </div>

      {/* Team Performance & Rank Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Performance */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" /> Team Performance
                </CardTitle>
                <CardDescription>Track downline volume, direct members and overall sales</CardDescription>
              </div>
              <Link href="/dashboard/tree">
                <Button variant="ghost" size="sm" className="text-xs text-primary">
                  View Tree <ChevronRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-muted/40 rounded-xl text-center">
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Downlines</span>
              <span className="text-xl sm:text-2xl font-black text-foreground mt-1 block">
                {profile?.teamCount || 0}
              </span>
              <span className="text-[10px] text-emerald-600 font-semibold">Members</span>
            </div>

            <div className="p-3 bg-muted/40 rounded-xl text-center">
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Personal Sales</span>
              <span className="text-xl sm:text-2xl font-black text-foreground mt-1 block">
                ৳{profile?.personalSales || 0}
              </span>
              <span className="text-[10px] text-primary font-semibold">Own PV</span>
            </div>

            <div className="p-3 bg-muted/40 rounded-xl text-center">
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Team Sales</span>
              <span className="text-xl sm:text-2xl font-black text-foreground mt-1 block">
                ৳{profile?.teamSales || 0}
              </span>
              <span className="text-[10px] text-blue-600 font-semibold">Group Volume</span>
            </div>
          </CardContent>
        </Card>

        {/* My Rank & Rank Progress */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Award className="h-5 w-5 text-amber-600" /> My Rank & Progress
                </CardTitle>
                <CardDescription>Achieve 6 active downlines to unlock next manager rank</CardDescription>
              </div>
              <Link href="/dashboard/rank-system">
                <Button variant="ghost" size="sm" className="text-xs text-amber-600">
                  Rank Rules <ChevronRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Current:</span>
                <Badge className="bg-amber-500 text-white font-bold">{profile?.rank || 'user'}</Badge>
              </div>
              <div className="font-bold text-primary">
                Next: {getNextRank()}
              </div>
            </div>

            <div className="space-y-1.5">
              <Progress value={getRankProgress()} className="h-3" />
              <div className="flex justify-between text-[11px] text-muted-foreground">
                <span>{profile?.directCount || 0} / 6 Active Direct Downlines</span>
                <span className="font-bold text-foreground">{getRankProgress()}% Completed</span>
              </div>
            </div>

            <div className="p-2.5 bg-amber-500/5 border border-amber-500/20 rounded-lg flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Team Manager Reward:</span>
              <span className="font-bold text-emerald-600 font-mono">+৳200 Cash + Seba Card</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Global Fund Pools Live Snapshot */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Globe className="h-5 w-5 text-teal-600" />
                Global Fund Pools Live Snapshot
              </CardTitle>
              <CardDescription>
                Live balance allocated from company package activations to the 5 designated community funds.
              </CardDescription>
            </div>
            <Link href="/dashboard/global-profit">
              <Button variant="outline" size="sm" className="text-xs border-teal-500/30 text-teal-700">
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
              <span className="text-[9px] text-muted-foreground">Shared to all members</span>
            </div>

            <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
              <span className="text-[10px] font-bold uppercase text-amber-700 dark:text-amber-400 block">Incentive Fund</span>
              <span className="text-lg font-black text-amber-950 dark:text-amber-300 mt-1 block">
                ৳{(globalFunds.incentiveFund || 0).toLocaleString()}
              </span>
              <span className="text-[9px] text-muted-foreground">Gadgets & tours</span>
            </div>

            <div className="p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/20">
              <span className="text-[10px] font-bold uppercase text-cyan-700 dark:text-cyan-400 block">Rank Dev Fund</span>
              <span className="text-lg font-black text-cyan-950 dark:text-cyan-300 mt-1 block">
                ৳{(globalFunds.rankDevelopmentFund || 0).toLocaleString()}
              </span>
              <span className="text-[9px] text-muted-foreground">Rank upgrade payouts</span>
            </div>

            <div className="p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/20">
              <span className="text-[10px] font-bold uppercase text-indigo-700 dark:text-indigo-400 block">Royalty Fund</span>
              <span className="text-lg font-black text-indigo-950 dark:text-indigo-300 mt-1 block">
                ৳{(globalFunds.royaltyFund || 0).toLocaleString()}
              </span>
              <span className="text-[9px] text-muted-foreground">Diamond+ royalties</span>
            </div>

            <div className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/20 col-span-2 sm:col-span-1">
              <span className="text-[10px] font-bold uppercase text-rose-700 dark:text-rose-400 block">Charity Fund</span>
              <span className="text-lg font-black text-rose-950 dark:text-rose-300 mt-1 block">
                ৳{(globalFunds.charityFund || 0).toLocaleString()}
              </span>
              <span className="text-[9px] text-muted-foreground">Social welfare</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
