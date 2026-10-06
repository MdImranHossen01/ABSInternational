'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  Coins,
  ArrowRight,
  RefreshCw,
  Wallet,
  Loader2,
  CheckCircle2,
  Send
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function TotalBonusPage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/user/profile');
        if (res.ok) setProfile(await res.json());
      } catch (err) {
        toast.error('Failed to load bonus details');
      } finally {
        setLoading(false);
      }
    }
    if (session?.user) loadData();
  }, [session]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-xs text-muted-foreground font-semibold">Loading Bonus Ledger...</p>
        </div>
      </div>
    );
  }

  const bonusAmount = profile?.bonusWallet || 0;

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="rounded-2xl bg-linear-to-r from-blue-700 via-indigo-700 to-primary p-6 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black">Total Bonus</h1>
            <p className="text-xs sm:text-sm opacity-90 mt-1 max-w-xl">
              Your available Bonus Wallet balance, earned from direct sponsors, multi-generation commissions, and leadership rank achievements.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl text-right shrink-0 border border-white/15">
            <span className="text-xs uppercase tracking-wider block opacity-80">Available Bonus Wallet</span>
            <span className="text-3xl font-black">৳{bonusAmount.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Action shortcuts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <Card className="border hover:border-primary/50 transition-all">
          <CardHeader>
            <div className="flex items-center justify-between">
              <RefreshCw className="h-5 w-5 text-emerald-600" />
              <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-500/30">Auto (≥ ৳500)</Badge>
            </div>
            <CardTitle className="text-base font-bold mt-2">Withdrawal Wallet</CardTitle>
            <CardDescription className="text-xs">Bonus ≥ ৳500 is auto-converted to Withdrawal Wallet for instant cashout.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/withdraw">
              <Button size="sm" className="w-full font-bold bg-purple-600 hover:bg-purple-700 text-white">
                Withdraw Funds <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border hover:border-primary/50 transition-all">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Send className="h-5 w-5 text-emerald-600" />
              <Badge variant="secondary">P2P</Badge>
            </div>
            <CardTitle className="text-base font-bold mt-2">Transfer to Member</CardTitle>
            <CardDescription className="text-xs">Send bonus balance instantly to any member ID in your downline.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/transfer">
              <Button size="sm" variant="outline" className="w-full font-bold">
                Transfer Now <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border hover:border-primary/50 transition-all">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Wallet className="h-5 w-5 text-purple-600" />
              <Badge variant="secondary">Ledger</Badge>
            </div>
            <CardTitle className="text-base font-bold mt-2">Bonus Statement</CardTitle>
            <CardDescription className="text-xs">View all detailed credits, splits and payouts from company fund pools.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/transaction-statement">
              <Button size="sm" variant="outline" className="w-full font-bold">
                View Ledger <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
