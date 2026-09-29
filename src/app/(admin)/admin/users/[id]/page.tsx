'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  User as UserIcon,
  Mail,
  Phone,
  Calendar,
  Shield,
  ShieldCheck,
  Crown,
  Trophy,
  CheckCircle2,
  Wallet,
  ShoppingBag,
  TrendingUp,
  Users as UsersIcon,
  Copy,
  ExternalLink,
  Search,
  Package,
  Clock,
  CreditCard,
  ChevronRight,
  AlertCircle,
  Loader2,
  Building2,
  Sparkles,
  DollarSign
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';

interface UserDetailData {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  image?: string;
  memberId?: string;
  sponsorId?: string;
  rank?: string;
  isSubscriptionActive?: boolean;
  depositWallet: number;
  bonusWallet: number;
  withdrawalWallet: number;
  walletBalance: number;
  personalSales: number;
  teamSales: number;
  teamCount: number;
  addresses?: any[];
  createdAt: string;
  lastActive?: string;
}

interface SponsorData {
  _id?: string;
  name: string;
  memberId: string;
  email?: string;
  phone?: string;
  rank?: string;
  isSubscriptionActive?: boolean;
  isCompany?: boolean;
  role?: string;
}

interface DownlineMember {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  memberId: string;
  rank?: string;
  isSubscriptionActive: boolean;
  role: string;
  createdAt: string;
  personalSales: number;
  teamSales: number;
  teamCount: number;
  totalOrders: number;
  totalSpent: number;
}

interface OrderData {
  _id: string;
  shortId: string;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  itemsCount: number;
  items: {
    name: string;
    quantity: number;
    price: number;
    image?: string;
  }[];
  createdAt: string;
}

interface StatsData {
  totalPurchaseAmount: number;
  totalOrdersCount: number;
  deliveredOrdersCount: number;
  confirmedOrdersCount: number;
  totalDownlinesCount: number;
  activeDownlinesCount: number;
  freeDownlinesCount: number;
  totalDownlineSales: number;
}

export default function AdminUserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserDetailData | null>(null);
  const [sponsor, setSponsor] = useState<SponsorData | null>(null);
  const [downlines, setDownlines] = useState<DownlineMember[]>([]);
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [stats, setStats] = useState<StatsData | null>(null);

  const [activeTab, setActiveTab] = useState<'downlines' | 'orders' | 'sponsor'>('downlines');
  const [downlineSearch, setDownlineSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');

  const fetchUserData = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`);
      if (!res.ok) {
        throw new Error('User not found');
      }
      const data = await res.json();
      setUser(data.user);
      setSponsor(data.sponsor);
      setDownlines(data.downlines || []);
      setOrders(data.orders || []);
      setStats(data.stats);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [userId]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  // Filtered Downlines
  const filteredDownlines = useMemo(() => {
    if (!downlineSearch.trim()) return downlines;
    const q = downlineSearch.toLowerCase();
    return downlines.filter(
      (d) =>
        d.name?.toLowerCase().includes(q) ||
        d.memberId?.toLowerCase().includes(q) ||
        d.email?.toLowerCase().includes(q) ||
        d.phone?.toLowerCase().includes(q)
    );
  }, [downlines, downlineSearch]);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    if (!orderSearch.trim()) return orders;
    const q = orderSearch.toLowerCase();
    return orders.filter(
      (o) =>
        o.shortId?.toLowerCase().includes(q) ||
        o.paymentMethod?.toLowerCase().includes(q) ||
        o.status?.toLowerCase().includes(q) ||
        o.items.some((it) => it.name?.toLowerCase().includes(q))
    );
  }, [orders, orderSearch]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm font-semibold text-muted-foreground">Loading user profile & network data...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center space-y-4">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
        <h2 className="text-xl font-bold">User Not Found</h2>
        <p className="text-sm text-muted-foreground">The requested user account does not exist or has been removed.</p>
        <Button onClick={() => router.push('/admin/users')} variant="outline" className="rounded-xl">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Users Directory
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 py-4 w-full animate-in fade-in duration-300">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
          <Link href="/admin/users" className="hover:text-primary transition-colors flex items-center gap-1 font-medium">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Users
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-semibold">{user.name}</span>
          <span className="font-mono text-primary font-bold">({user.memberId || 'No ID'})</span>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/admin/users">
            <Button variant="outline" size="sm" className="rounded-xl text-xs font-semibold">
              Users Directory
            </Button>
          </Link>
        </div>
      </div>

      {/* 1. HERO PROFILE SECTION */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-br from-white via-slate-50/50 to-blue-50/30 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Avatar + Main Info */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="relative">
              {user.image ? (
                <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl overflow-hidden ring-4 ring-white shadow-md">
                  <Image
                    src={user.image}
                    alt={user.name}
                    width={96}
                    height={96}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-3xl font-black shadow-md ring-4 ring-white">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
              {/* Active Badge on Avatar */}
              <div className="absolute -bottom-1.5 -right-1.5">
                {user.isSubscriptionActive ? (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white shadow-xs" title="Active Subscription">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </span>
                ) : (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-300 text-slate-700 shadow-xs" title="Free Member">
                    <UserIcon className="h-3 w-3" />
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">{user.name}</h1>
                <Badge
                  className={`capitalize px-2.5 py-0.5 rounded-full font-bold text-xs ${
                    user.role === 'admin' || user.role === 'super_admin'
                      ? 'bg-blue-600 text-white'
                      : user.role === 'manager'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-800 border-slate-200'
                  }`}
                >
                  {user.role}
                </Badge>
                {user.isSubscriptionActive ? (
                  <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold">
                    Active Subscriber
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-slate-100 text-slate-600 border-slate-300 text-xs">
                    Free Member
                  </Badge>
                )}
                {user.rank && user.rank !== 'user' && (
                  <Badge className="bg-amber-100 text-amber-900 border-amber-300 text-xs font-bold flex items-center gap-1">
                    <Trophy className="h-3 w-3 text-amber-600" />
                    {user.rank}
                  </Badge>
                )}
              </div>

              {/* Member ID & Sponsor Link Pill */}
              <div className="flex flex-wrap items-center gap-2.5 text-xs">
                <div className="flex items-center gap-1 bg-white/90 border border-slate-200 rounded-lg px-2.5 py-1 font-mono shadow-2xs">
                  <span className="text-muted-foreground">ID:</span>
                  <span className="font-bold text-primary">{user.memberId || 'N/A'}</span>
                  {user.memberId && (
                    <button
                      onClick={() => copyToClipboard(user.memberId!, 'Member ID')}
                      className="ml-1 text-slate-400 hover:text-slate-700 transition-colors"
                      title="Copy Member ID"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                  )}
                </div>

                {user.sponsorId && (
                  <div className="flex items-center gap-1 bg-white/90 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-600 shadow-2xs">
                    <span className="text-muted-foreground">Sponsor:</span>
                    <span className="font-bold text-slate-800">{user.sponsorId}</span>
                  </div>
                )}

                <div className="flex items-center gap-1 text-muted-foreground font-medium">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Joined: {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
              </div>

              {/* Contact Links */}
              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-600">
                <a
                  href={`mailto:${user.email}`}
                  className="flex items-center gap-1 hover:text-primary transition-colors font-medium bg-slate-100/80 hover:bg-slate-200/80 px-2 py-0.5 rounded-md"
                >
                  <Mail className="h-3.5 w-3.5 text-slate-500" />
                  <span>{user.email}</span>
                </a>
                {user.phone && (
                  <a
                    href={`tel:${user.phone}`}
                    className="flex items-center gap-1 hover:text-primary transition-colors font-medium bg-slate-100/80 hover:bg-slate-200/80 px-2 py-0.5 rounded-md"
                  >
                    <Phone className="h-3.5 w-3.5 text-slate-500" />
                    <span>{user.phone}</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Quick Metrics Badges in Hero */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-white/80 p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs backdrop-blur-xs min-w-[280px]">
            <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-100">
              <span className="text-[11px] font-bold text-muted-foreground block">Personal Purchases</span>
              <span className="text-base font-black text-slate-900 mt-0.5 block">
                ৳{(stats?.totalPurchaseAmount || 0).toLocaleString()}
              </span>
              <span className="text-[10px] text-muted-foreground">{stats?.totalOrdersCount || 0} Orders placed</span>
            </div>

            <div className="p-2.5 rounded-xl bg-blue-50/50 border border-blue-100">
              <span className="text-[11px] font-bold text-blue-700 block">Direct Downlines</span>
              <span className="text-base font-black text-blue-900 mt-0.5 block">
                {stats?.totalDownlinesCount || 0} Members
              </span>
              <span className="text-[10px] text-emerald-600 font-bold">{stats?.activeDownlinesCount || 0} Active</span>
            </div>

            <div className="p-2.5 rounded-xl bg-amber-50/50 border border-amber-100 col-span-2 sm:col-span-1">
              <span className="text-[11px] font-bold text-amber-700 block">Bonus Wallet</span>
              <span className="text-base font-black text-amber-900 mt-0.5 block">
                ৳{(user.bonusWallet || 0).toLocaleString()}
              </span>
              <span className="text-[10px] text-muted-foreground">MLM Earnings</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. FINANCIAL & MLM WALLETS SUMMARY ROW */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Deposit Wallet */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Deposit Wallet</span>
            <div className="h-8 w-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Wallet className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
            ৳{(user.depositWallet || 0).toLocaleString()}
          </p>
          <span className="text-[11px] text-muted-foreground font-medium">Funds deposited for shopping</span>
        </div>

        {/* Bonus Wallet */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Bonus Wallet</span>
            <div className="h-8 w-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-amber-950 mt-2">
            ৳{(user.bonusWallet || 0).toLocaleString()}
          </p>
          <span className="text-[11px] text-muted-foreground font-medium">Referrals & generation bonus</span>
        </div>

        {/* Withdrawal Wallet */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Withdrawal Wallet</span>
            <div className="h-8 w-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-emerald-950 mt-2">
            ৳{(user.withdrawalWallet || 0).toLocaleString()}
          </p>
          <span className="text-[11px] text-muted-foreground font-medium">Available balance for payout</span>
        </div>

        {/* Total Purchases Count */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Purchase Amount Count</span>
            <div className="h-8 w-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <ShoppingBag className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-purple-950 mt-2">
            ৳{(stats?.totalPurchaseAmount || 0).toLocaleString()}
          </p>
          <span className="text-[11px] text-muted-foreground font-medium">{orders.length} total orders completed</span>
        </div>
      </div>

      {/* 3. SPONSOR CARD */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <UsersIcon className="h-4 w-4" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Sponsor Information</h3>
          </div>
          <span className="text-xs text-muted-foreground">Who introduced this user</span>
        </div>

        {sponsor ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/70 p-4 rounded-xl border border-slate-200/60">
            <div className="flex items-center gap-3.5">
              <div className="h-11 w-11 rounded-xl bg-gradient-to-tr from-slate-800 to-indigo-900 text-white flex items-center justify-center font-bold text-sm shadow-2xs">
                {sponsor.isCompany ? <Building2 className="h-5 w-5" /> : (sponsor.name ? sponsor.name.charAt(0).toUpperCase() : 'S')}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm sm:text-base">{sponsor.name}</span>
                  {sponsor.isCompany ? (
                    <Badge className="bg-blue-600 text-white text-[10px]">Company Root</Badge>
                  ) : sponsor.isSubscriptionActive ? (
                    <Badge className="bg-emerald-500 text-white text-[10px]">Active</Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px]">Free</Badge>
                  )}
                  {sponsor.rank && (
                    <Badge className="bg-amber-100 text-amber-900 border-amber-300 text-[10px]">
                      {sponsor.rank}
                    </Badge>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mt-0.5">
                  <span className="font-mono font-bold text-primary">ID: {sponsor.memberId}</span>
                  {sponsor.email && <span>• {sponsor.email}</span>}
                  {sponsor.phone && <span>• {sponsor.phone}</span>}
                </div>
              </div>
            </div>

            {/* If sponsor has an ID in database, link to their profile */}
            {sponsor._id && (
              <Link href={`/admin/users/${sponsor._id}`}>
                <Button size="sm" variant="outline" className="rounded-xl text-xs font-bold gap-1 bg-white hover:bg-slate-100">
                  <span>View Sponsor Profile</span>
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="p-4 text-center text-xs text-muted-foreground">
            No sponsor assigned to this user (Direct / Root account).
          </div>
        )}
      </div>

      {/* 4. MAIN TABS: Downline List & Purchase History */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveTab('downlines')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all ${
              activeTab === 'downlines'
                ? 'bg-primary text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <UsersIcon className="h-4 w-4" />
            <span>Downline Members List ({downlines.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all ${
              activeTab === 'orders'
                ? 'bg-primary text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ShoppingBag className="h-4 w-4" />
            <span>Purchase History ({orders.length})</span>
          </button>
        </div>

        {/* TAB 1: DOWNLINE MEMBERS LIST */}
        {activeTab === 'downlines' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Search & Stats Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search downline by name, member ID, phone..."
                  value={downlineSearch}
                  onChange={(e) => setDownlineSearch(e.target.value)}
                  className="pl-9 h-10 bg-white rounded-xl border border-slate-200 text-xs sm:text-sm"
                />
                {downlineSearch && (
                  <button
                    onClick={() => setDownlineSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground font-bold"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs font-semibold">
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-lg">
                  {stats?.activeDownlinesCount || 0} Active Subscribers
                </span>
                <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg">
                  {stats?.freeDownlinesCount || 0} Free
                </span>
                <span className="bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-1 rounded-lg">
                  Total Downline Sales: ৳{(stats?.totalDownlineSales || 0).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Downline Table */}
            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50/80">
                    <TableRow>
                      <TableHead className="font-bold text-xs">Member Name & ID</TableHead>
                      <TableHead className="font-bold text-xs">MLM Rank</TableHead>
                      <TableHead className="font-bold text-xs">Subscription</TableHead>
                      <TableHead className="font-bold text-xs">Purchase Amount Count</TableHead>
                      <TableHead className="font-bold text-xs">Direct Team</TableHead>
                      <TableHead className="font-bold text-xs">Contact Info</TableHead>
                      <TableHead className="font-bold text-xs">Joined Date</TableHead>
                      <TableHead className="text-right font-bold text-xs">Profile</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDownlines.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="h-36 text-center text-xs text-muted-foreground">
                          {downlines.length === 0
                            ? 'This member does not have any direct downlines registered yet.'
                            : 'No downline members matched your search.'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredDownlines.map((member) => (
                        <TableRow key={member._id} className="hover:bg-slate-50/80 transition-colors">
                          {/* Member Name & ID */}
                          <TableCell>
                            <div className="flex items-center gap-2.5">
                              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                {member.name ? member.name.charAt(0).toUpperCase() : 'M'}
                              </div>
                              <div className="flex flex-col">
                                <Link
                                  href={`/admin/users/${member._id}`}
                                  className="font-bold text-slate-900 hover:text-primary transition-colors text-xs sm:text-sm hover:underline"
                                >
                                  {member.name}
                                </Link>
                                <span className="font-mono text-[11px] text-primary font-bold">
                                  {member.memberId}
                                </span>
                              </div>
                            </div>
                          </TableCell>

                          {/* MLM Rank */}
                          <TableCell>
                            {member.rank && member.rank !== 'user' ? (
                              <Badge className="bg-amber-100 text-amber-900 border-amber-300 text-[10px] font-bold">
                                {member.rank}
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-[10px] text-muted-foreground">
                                General
                              </Badge>
                            )}
                          </TableCell>

                          {/* Subscription Status */}
                          <TableCell>
                            {member.isSubscriptionActive ? (
                              <Badge className="bg-emerald-500 text-white text-[10px] font-bold">
                                Active (৳1,500)
                              </Badge>
                            ) : (
                              <Badge className="bg-slate-200 text-slate-700 text-[10px]">
                                Free
                              </Badge>
                            )}
                          </TableCell>

                          {/* Purchase Amount Count */}
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-900 text-xs">
                                ৳{(member.totalSpent || 0).toLocaleString()}
                              </span>
                              <span className="text-[10px] text-muted-foreground">
                                {member.totalOrders || 0} Orders
                              </span>
                            </div>
                          </TableCell>

                          {/* Direct Team */}
                          <TableCell>
                            <span className="text-xs font-semibold text-slate-700">
                              {member.teamCount || 0} Members
                            </span>
                          </TableCell>

                          {/* Contact Info */}
                          <TableCell>
                            <div className="flex flex-col text-xs text-slate-600">
                              <span>{member.email}</span>
                              {member.phone && <span className="text-[11px] text-slate-400">{member.phone}</span>}
                            </div>
                          </TableCell>

                          {/* Joined Date */}
                          <TableCell className="text-xs text-muted-foreground">
                            {new Date(member.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </TableCell>

                          {/* Profile Link */}
                          <TableCell className="text-right">
                            <Link href={`/admin/users/${member._id}`}>
                              <Button size="sm" variant="ghost" className="h-8 px-2 text-xs font-bold text-primary hover:text-primary">
                                View Profile <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards View */}
              <div className="md:hidden divide-y divide-slate-100">
                {filteredDownlines.length === 0 ? (
                  <div className="p-6 text-center text-xs text-muted-foreground">
                    {downlines.length === 0
                      ? 'This member does not have any direct downlines registered yet.'
                      : 'No downline members matched your search.'}
                  </div>
                ) : (
                  filteredDownlines.map((member) => (
                    <div key={member._id} className="p-3.5 space-y-2.5 bg-white">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                            {member.name ? member.name.charAt(0).toUpperCase() : 'M'}
                          </div>
                          <div>
                            <Link
                              href={`/admin/users/${member._id}`}
                              className="font-bold text-slate-900 hover:text-primary text-sm leading-tight block"
                            >
                              {member.name}
                            </Link>
                            <span className="font-mono text-xs text-primary font-semibold">
                              {member.memberId}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          {member.rank && member.rank !== 'user' ? (
                            <Badge className="bg-amber-100 text-amber-900 border-amber-300 text-[10px] font-bold">
                              {member.rank}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px] text-muted-foreground">
                              General
                            </Badge>
                          )}
                          {member.isSubscriptionActive ? (
                            <Badge className="bg-emerald-500 text-white text-[10px] font-bold">
                              Active
                            </Badge>
                          ) : (
                            <Badge className="bg-slate-200 text-slate-700 text-[10px]">
                              Free
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs">
                        <div>
                          <span className="text-[10px] text-muted-foreground block font-medium">Purchases</span>
                          <span className="font-bold text-slate-900">৳{(member.totalSpent || 0).toLocaleString()}</span>
                          <span className="text-[10px] text-muted-foreground ml-1">({member.totalOrders || 0} orders)</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-muted-foreground block font-medium">Direct Team</span>
                          <span className="font-bold text-slate-900">{member.teamCount || 0} Members</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <div className="text-[11px] text-slate-500 truncate max-w-[180px]">
                          {member.phone || member.email}
                        </div>
                        <Link href={`/admin/users/${member._id}`}>
                          <Button size="sm" variant="outline" className="h-7 px-2.5 text-xs font-bold text-primary">
                            Profile <ChevronRight className="h-3 w-3 ml-0.5" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PURCHASE AMOUNT & ORDER HISTORY */}
        {activeTab === 'orders' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Search & Summary Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search orders by ID, product name, status..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="pl-9 h-10 bg-white rounded-xl border border-slate-200 text-xs sm:text-sm"
                />
                {orderSearch && (
                  <button
                    onClick={() => setOrderSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground font-bold"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs font-bold">
                <span className="bg-purple-50 text-purple-800 border border-purple-200 px-3 py-1.5 rounded-lg">
                  Total Spent: ৳{(stats?.totalPurchaseAmount || 0).toLocaleString()}
                </span>
                <span className="bg-slate-100 text-slate-800 px-3 py-1.5 rounded-lg">
                  {orders.length} Total Orders
                </span>
              </div>
            </div>

            {/* Orders Table */}
            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50/80">
                    <TableRow>
                      <TableHead className="font-bold text-xs">Order ID</TableHead>
                      <TableHead className="font-bold text-xs">Date & Time</TableHead>
                      <TableHead className="font-bold text-xs">Purchased Items</TableHead>
                      <TableHead className="font-bold text-xs">Amount</TableHead>
                      <TableHead className="font-bold text-xs">Payment Method</TableHead>
                      <TableHead className="font-bold text-xs">Payment Status</TableHead>
                      <TableHead className="font-bold text-xs">Order Status</TableHead>
                      <TableHead className="text-right font-bold text-xs">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="h-36 text-center text-xs text-muted-foreground">
                          {orders.length === 0
                            ? 'No purchase history found for this user.'
                            : 'No orders matched your search criteria.'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredOrders.map((order) => (
                        <TableRow key={order._id} className="hover:bg-slate-50/80 transition-colors">
                          {/* Order ID */}
                          <TableCell>
                            <span className="font-mono font-bold text-primary text-xs">
                              #{order.shortId}
                            </span>
                          </TableCell>

                          {/* Date */}
                          <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                            {new Date(order.createdAt).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </TableCell>

                          {/* Items */}
                          <TableCell className="max-w-[280px]">
                            <div className="space-y-1">
                              {order.items.slice(0, 2).map((item, idx) => (
                                <div key={idx} className="flex items-center gap-1.5 text-xs">
                                  <span className="font-medium text-slate-800 truncate block max-w-[200px]">
                                    {item.name}
                                  </span>
                                  <span className="text-muted-foreground text-[11px] font-mono">
                                    ×{item.quantity}
                                  </span>
                                </div>
                              ))}
                              {order.items.length > 2 && (
                                <span className="text-[10px] text-muted-foreground font-semibold">
                                  +{order.items.length - 2} more item(s)
                                </span>
                              )}
                            </div>
                          </TableCell>

                          {/* Amount */}
                          <TableCell>
                            <span className="font-black text-slate-900 text-xs sm:text-sm">
                              ৳{order.totalAmount.toLocaleString()}
                            </span>
                          </TableCell>

                          {/* Payment Method */}
                          <TableCell>
                            <span className="capitalize text-xs font-medium text-slate-700">
                              {order.paymentMethod || 'Manual'}
                            </span>
                          </TableCell>

                          {/* Payment Status */}
                          <TableCell>
                            <Badge
                              className={`text-[10px] font-bold ${
                                order.paymentStatus === 'Paid'
                                  ? 'bg-emerald-500 text-white'
                                  : order.paymentStatus === 'Pending'
                                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                                  : 'bg-red-100 text-red-900'
                              }`}
                            >
                              {order.paymentStatus}
                            </Badge>
                          </TableCell>

                          {/* Order Status */}
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`text-[10px] font-semibold ${
                                order.status === 'Delivered'
                                  ? 'border-emerald-500 text-emerald-700 bg-emerald-50'
                                  : order.status === 'Confirmed'
                                  ? 'border-blue-500 text-blue-700 bg-blue-50'
                                  : 'border-slate-300 text-slate-700'
                              }`}
                            >
                              {order.status}
                            </Badge>
                          </TableCell>

                          {/* Action */}
                          <TableCell className="text-right">
                            <Link href={`/admin/orders`}>
                              <Button size="sm" variant="ghost" className="h-8 px-2 text-xs font-bold text-primary">
                                Orders View
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards View */}
              <div className="md:hidden divide-y divide-slate-100">
                {filteredOrders.length === 0 ? (
                  <div className="p-6 text-center text-xs text-muted-foreground">
                    {orders.length === 0
                      ? 'No purchase history found for this user.'
                      : 'No orders matched your search criteria.'}
                  </div>
                ) : (
                  filteredOrders.map((order) => (
                    <div key={order._id} className="p-3.5 space-y-2.5 bg-white">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="font-mono font-bold text-primary text-xs">
                            #{order.shortId}
                          </span>
                          <div className="text-[11px] text-muted-foreground">
                            {new Date(order.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Badge
                            className={`text-[10px] font-bold ${
                              order.paymentStatus === 'Paid'
                                ? 'bg-emerald-500 text-white'
                                : order.paymentStatus === 'Pending'
                                ? 'bg-amber-100 text-amber-900 border-amber-300'
                                : 'bg-red-100 text-red-900'
                            }`}
                          >
                            {order.paymentStatus}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={`text-[10px] font-semibold ${
                              order.status === 'Delivered'
                                ? 'border-emerald-500 text-emerald-700 bg-emerald-50'
                                : order.status === 'Confirmed'
                                ? 'border-blue-500 text-blue-700 bg-blue-50'
                                : 'border-slate-300 text-slate-700'
                            }`}
                          >
                            {order.status}
                          </Badge>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1 text-xs">
                        {order.items.slice(0, 2).map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between text-slate-700">
                            <span className="truncate max-w-[200px]">{item.name}</span>
                            <span className="font-mono text-muted-foreground shrink-0">×{item.quantity}</span>
                          </div>
                        ))}
                        {order.items.length > 2 && (
                          <span className="text-[10px] text-muted-foreground font-semibold block pt-0.5">
                            +{order.items.length - 2} more item(s)
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <div>
                          <span className="text-[10px] text-muted-foreground block font-medium">Total ({order.paymentMethod || 'Manual'})</span>
                          <span className="font-black text-slate-900 text-sm">
                            ৳{order.totalAmount.toLocaleString()}
                          </span>
                        </div>
                        <Link href={`/admin/orders`}>
                          <Button size="sm" variant="outline" className="h-7 px-2.5 text-xs font-bold text-primary">
                            View Order
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
