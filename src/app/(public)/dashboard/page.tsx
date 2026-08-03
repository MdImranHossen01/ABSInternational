'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
    Clock, 
    CheckCircle2, 
    Truck, 
    Package,
    ChevronRight,
    Loader2,
    TrendingUp,
    Users,
    Wallet,
    Award,
    ShieldAlert,
    AlertCircle
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
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const profileRes = await fetch('/api/user/profile');
        if (profileRes.ok) {
          const data = await profileRes.json();
          setProfile(data);
        } else {
          toast.error('Failed to load profile details');
        }
      } catch (error) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    }
    if (session?.user) {
      fetchProfile();
    }
  }, [session]);

  const handleActivate = async () => {
    if (!profile) return;
    
    const result = await Swal.fire({
      title: 'Activate Account?',
      text: 'This will purchase the Joining Package for 1,500 BDT from your Deposit Wallet. You will become a Premium Member and receive Seba health benefits.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Activate!',
      cancelButtonText: 'Cancel',
      confirmButtonColor: 'var(--primary)',
      background: 'white'
    });

    if (!result.isConfirmed) return;

    setActivating(true);
    try {
      const res = await fetch('/api/user/activate', { method: 'POST' });
      const data = await res.json();
      
      if (res.ok) {
        Swal.fire({
          title: 'Success!',
          text: data.message,
          icon: 'success',
          confirmButtonColor: 'var(--primary)'
        });
        // Reload details
        const profileRes = await fetch('/api/user/profile');
        if (profileRes.ok) setProfile(await profileRes.json());
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
    // Simple mock logic for rank progression towards next level
    switch (profile.rank) {
      case 'user': return 0;
      case 'Premium Member': return Math.min(100, Math.round((profile.teamCount / 6) * 100));
      default: return 100;
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
      <div className="flex justify-center p-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-linear-to-r from-primary to-primary/80 text-primary-foreground shadow-lg">
        <div>
          <h1 className="text-2xl md:text-3xl font-black">Welcome back, {profile?.name}!</h1>
          <p className="text-sm opacity-90 mt-1">Manage your Multi-Level Marketing team, wallet transactions, and health benefits here.</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 text-xs font-mono bg-white/10 p-3 rounded-lg w-fit">
            <div>Member ID: <span className="font-bold">{profile?.memberId || 'N/A'}</span></div>
            <div>Sponsor ID: <span className="font-bold">{profile?.sponsorId || 'None'}</span></div>
          </div>
        </div>
        {!profile?.isSubscriptionActive && (
          <Button 
            onClick={handleActivate} 
            disabled={activating}
            className="bg-white text-primary hover:bg-white/90 font-bold h-12 px-6 rounded-xl shrink-0"
          >
            {activating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Activate Membership (৳1,500)'}
          </Button>
        )}
      </div>

      {/* KYC Alert if not approved */}
      {profile?.nidStatus !== 'Approved' && (
        <Card className="border-amber-500/20 bg-amber-500/5">
          <CardContent className="pt-6 flex items-start gap-4">
            <AlertCircle className="h-6 w-6 text-amber-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-bold text-amber-800">KYC Verification Required</h4>
              <p className="text-xs text-amber-700 mt-1">Please upload your National ID (NID) cards on the profile page to enable withdrawals and system access.</p>
              <Button size="sm" variant="outline" className="mt-3 h-8 border-amber-500/30 hover:bg-amber-500/10 text-amber-800" onClick={() => router.push('/dashboard/profile')}>
                Complete Verification
              </Button>
            </div>
            <Badge variant="outline" className="border-amber-500 text-amber-700 bg-amber-500/10 capitalize">
              {profile?.nidStatus || 'Not Submitted'}
            </Badge>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white border shadow-xs">
          <CardContent className="pt-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Personal Sales</p>
              <div className="text-2xl font-black">৳{profile?.personalSales || 0}</div>
            </div>
            <div className="p-3 rounded-xl bg-primary/5 text-primary">
              <TrendingUp className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border shadow-xs">
          <CardContent className="pt-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Team Sales</p>
              <div className="text-2xl font-black">৳{profile?.teamSales || 0}</div>
            </div>
            <div className="p-3 rounded-xl bg-primary/5 text-primary">
              <Package className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border shadow-xs">
          <CardContent className="pt-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Total Downlines</p>
              <div className="text-2xl font-black">{profile?.teamCount || 0} Members</div>
            </div>
            <div className="p-3 rounded-xl bg-primary/5 text-primary">
              <Users className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Wallets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border border-emerald-500/10 bg-emerald-500/[0.02]">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase text-emerald-800 tracking-wider flex items-center gap-1.5">
              <Wallet className="h-4 w-4" /> Deposit Wallet
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-emerald-950">৳{profile?.depositWallet || 0}</div>
            <p className="text-[10px] text-muted-foreground mt-1">For package joining and purchases</p>
          </CardContent>
        </Card>

        <Card className="border border-blue-500/10 bg-blue-500/[0.02]">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase text-blue-800 tracking-wider flex items-center gap-1.5">
              <Award className="h-4 w-4" /> Available Bonus Wallet
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-blue-950">৳{profile?.bonusWallet || 0}</div>
            <p className="text-[10px] text-muted-foreground mt-1">Earnings and multi-generation commissions</p>
          </CardContent>
        </Card>

        <Card className="border border-purple-500/10 bg-purple-500/[0.02]">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase text-purple-800 tracking-wider flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4" /> Withdrawal Wallet
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-purple-950">৳{profile?.withdrawalWallet || 0}</div>
            <p className="text-[10px] text-muted-foreground mt-1">Withdrawable to Bank/MFS</p>
          </CardContent>
        </Card>
      </div>

      {/* Rank Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" /> Rank & Promotion Progress
          </CardTitle>
          <CardDescription>Track downline numbers to qualify for higher tiers</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <div>Current Rank: <Badge variant="secondary" className="ml-1 font-bold">{profile?.rank || 'user'}</Badge></div>
            <div className="font-bold text-primary">Next: {getNextRank()}</div>
          </div>
          <div className="space-y-1">
            <Progress value={getRankProgress()} className="h-3" />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>{profile?.teamCount} active downline direct counts</span>
              <span>Need 6 to qualify next tier</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
