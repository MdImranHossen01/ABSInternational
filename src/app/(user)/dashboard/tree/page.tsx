'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import {
  Users,
  ChevronDown,
  ChevronRight,
  Loader2,
  Network,
  Eye,
  ArrowDownLeft,
  ArrowUpRight,
  Phone,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';

export default function MyTreePage() {
  const { data: session, status } = useSession();
  const [network, setNetwork] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [openGen, setOpenGen] = useState<number | null>(1);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Member details modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const latestMemberIdRef = useRef<string | null>(null);

  useEffect(() => {
    async function fetchTree() {
      try {
        const res = await fetch(`/api/user/network?status=${filter}`);
        if (res.ok) {
          const data = await res.json();
          setNetwork(data);
        } else {
          toast.error('Failed to load genealogy tree');
        }
      } catch (err) {
        toast.error('Network connection error');
      } finally {
        setLoading(false);
      }
    }

    if (status === 'authenticated' && session?.user) {
      fetchTree();
    }
  }, [session, status, filter]);

  const handleMemberClick = async (memberId: string) => {
    latestMemberIdRef.current = memberId;
    setModalOpen(true);
    setDetailLoading(true);
    setSelectedMember(null);
    try {
      const res = await fetch(`/api/user/network/member-detail?memberId=${encodeURIComponent(memberId)}`);
      if (latestMemberIdRef.current !== memberId) return;
      if (res.ok) {
        const data = await res.json();
        if (latestMemberIdRef.current === memberId) {
          setSelectedMember(data);
        }
      } else {
        toast.error('Failed to load member profile history');
      }
    } catch (err) {
      if (latestMemberIdRef.current === memberId) {
        toast.error('Failed to connect to server');
      }
    } finally {
      if (latestMemberIdRef.current === memberId) {
        setDetailLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-xs text-muted-foreground font-semibold">Loading 10-Generation Tree...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl bg-linear-to-r from-blue-700 via-indigo-700 to-primary p-6 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black">My Tree (Genealogy Network)</h1>
            <p className="text-xs sm:text-sm opacity-90 mt-1">
              Visual 10-level downline genealogy network. Click on any member to inspect their team count, sales volume, withdrawals, and deposit history.
            </p>
          </div>
          <div className="flex gap-2 bg-white/10 p-1.5 rounded-xl self-start sm:self-auto border border-white/20">
            <Button
              variant={filter === 'all' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilter('all')}
              className={`text-xs font-bold ${filter === 'all' ? 'bg-white text-primary' : 'text-white'}`}
            >
              All
            </Button>
            <Button
              variant={filter === 'active' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilter('active')}
              className={`text-xs font-bold ${filter === 'active' ? 'bg-white text-emerald-700' : 'text-white'}`}
            >
              Active
            </Button>
            <Button
              variant={filter === 'inactive' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilter('inactive')}
              className={`text-xs font-bold ${filter === 'inactive' ? 'bg-white text-rose-700' : 'text-white'}`}
            >
              Inactive
            </Button>
          </div>
        </div>
      </div>

      {/* 10-Level Downline Generation Tree */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Network className="h-5 w-5 text-primary" /> 10-Level Downline Generation Tree
          </CardTitle>
          <CardDescription>
            Click on any member in the table to inspect their team stats, sales, withdrawal history, and wallet deposit balances.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {network?.generations?.map((gen: any) => (
            <div key={gen.level} className="border rounded-xl overflow-hidden bg-card shadow-xs">
              <button
                onClick={() => setOpenGen(openGen === gen.level ? null : gen.level)}
                className="w-full flex items-center justify-between p-3.5 sm:p-4 hover:bg-muted/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-black text-xs">
                    G{gen.level}
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-xs sm:text-sm">Generation {gen.level}</div>
                    <div className="text-[11px] text-muted-foreground">{gen.members?.length || 0} Members</div>
                  </div>
                </div>
                {openGen === gen.level ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
              </button>

              {openGen === gen.level && (
                <div className="p-3 sm:p-4 bg-muted/15 border-t">
                  {gen.members?.length === 0 ? (
                    <div className="text-center py-4 text-xs text-muted-foreground">
                      No members in Generation {gen.level} under this filter.
                    </div>
                  ) : (
                    <div className="rounded-lg border bg-card overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead>Member ID</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Sponsor ID</TableHead>
                            <TableHead>Rank</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {gen.members.map((member: any) => (
                            <TableRow
                              key={member.memberId}
                              onClick={() => handleMemberClick(member.memberId)}
                              className="cursor-pointer hover:bg-primary/[0.04] transition-colors group"
                            >
                              <TableCell className="font-mono text-xs font-bold text-primary">
                                {member.memberId}
                              </TableCell>
                              <TableCell className="font-bold text-xs">{member.name}</TableCell>
                              <TableCell className="font-mono text-xs text-muted-foreground">
                                {member.sponsorId || 'None'}
                              </TableCell>
                              <TableCell className="text-xs capitalize">{member.rank}</TableCell>
                              <TableCell>
                                {member.isSubscriptionActive ? (
                                  <Badge className="bg-emerald-500 text-white text-[10px] py-0.5 px-2">Active</Badge>
                                ) : (
                                  <Badge className="bg-slate-300 text-slate-800 text-[10px] py-0.5 px-2">Inactive</Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-xs font-semibold border-primary/30 text-primary group-hover:bg-primary group-hover:text-white transition-colors"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMemberClick(member.memberId);
                                  }}
                                >
                                  <Eye className="mr-1 h-3.5 w-3.5" /> Details
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Member Details Modal (Team size, Sales, Withdrawals, Balances) */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto p-5 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-black flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" /> Member Downline Profile
            </DialogTitle>
            <DialogDescription>
              Detailed network statistics, sales volume, withdrawals, and wallet balance ledger.
            </DialogDescription>
          </DialogHeader>

          {detailLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-xs text-muted-foreground font-semibold">Loading member details & ledger...</p>
            </div>
          ) : selectedMember?.member ? (
            <div className="space-y-5">
              {/* Member Card Banner */}
              <div className="p-4 rounded-xl bg-muted/50 border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-foreground">{selectedMember.member.name}</h3>
                    <Badge variant="outline" className="border-primary text-primary font-bold text-[10px]">
                      {selectedMember.member.rank}
                    </Badge>
                    {selectedMember.member.isSubscriptionActive ? (
                      <Badge className="bg-emerald-500 text-white text-[10px]">Active</Badge>
                    ) : (
                      <Badge className="bg-slate-300 text-slate-800 text-[10px]">Inactive</Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1.5 font-mono">
                    <div>ID: <span className="font-bold text-foreground">{selectedMember.member.memberId}</span></div>
                    <div>Sponsor: <span className="font-bold text-foreground">{selectedMember.member.sponsorId}</span></div>
                    {selectedMember.member.phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3" /> {selectedMember.member.phone}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 4 Summary Highlight Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* 1. Team Size */}
                <div className="p-3 rounded-xl border bg-card shadow-2xs">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">Team Size</span>
                  <div className="text-xl font-black text-primary mt-1">
                    {selectedMember.member.teamCount || 0}
                  </div>
                  <span className="text-[10px] text-muted-foreground">Direct: {selectedMember.member.directCount || 0}</span>
                </div>

                {/* 2. Sales Volume */}
                <div className="p-3 rounded-xl border bg-card shadow-2xs">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">Sales Volume</span>
                  <div className="text-xl font-black text-blue-700 dark:text-blue-400 mt-1">
                    ৳{(selectedMember.member.personalSales || 0).toLocaleString()}
                  </div>
                  <span className="text-[10px] text-muted-foreground">Team: ৳{(selectedMember.member.teamSales || 0).toLocaleString()}</span>
                </div>

                {/* 3. Wallet Balances */}
                <div className="p-3 rounded-xl border bg-card shadow-2xs">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">Deposit Balance</span>
                  <div className="text-xl font-black text-emerald-700 dark:text-emerald-400 mt-1">
                    ৳{(selectedMember.member.depositWallet || 0).toLocaleString()}
                  </div>
                  <span className="text-[10px] text-muted-foreground">Bonus: ৳{(selectedMember.member.bonusWallet || 0).toLocaleString()}</span>
                </div>

                {/* 4. Total Withdrawn */}
                <div className="p-3 rounded-xl border bg-card shadow-2xs">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">Total Withdrawn</span>
                  <div className="text-xl font-black text-purple-700 dark:text-purple-400 mt-1">
                    ৳{(selectedMember.member.totalWithdrawn || 0).toLocaleString()}
                  </div>
                  <span className="text-[10px] text-muted-foreground">Cashout total</span>
                </div>
              </div>

              {/* Detailed History Tabs */}
              <Tabs defaultValue="withdrawals" className="space-y-3">
                <TabsList className="grid grid-cols-2 w-full max-w-sm">
                  <TabsTrigger value="withdrawals" className="text-xs font-semibold flex items-center gap-1.5">
                    <ArrowDownLeft className="h-3.5 w-3.5 text-purple-600" /> Withdrawal History
                  </TabsTrigger>
                  <TabsTrigger value="deposits" className="text-xs font-semibold flex items-center gap-1.5">
                    <ArrowUpRight className="h-3.5 w-3.5 text-emerald-600" /> Deposit History
                  </TabsTrigger>
                </TabsList>

                {/* Tab: Withdrawal History */}
                <TabsContent value="withdrawals" className="space-y-2">
                  {selectedMember.withdrawals?.length === 0 ? (
                    <div className="p-6 text-center text-xs text-muted-foreground border rounded-lg bg-muted/20">
                      No withdrawals recorded yet.
                    </div>
                  ) : (
                    <div className="border rounded-lg overflow-x-auto max-h-56">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead className="text-xs">Date</TableHead>
                            <TableHead className="text-xs">Amount</TableHead>
                            <TableHead className="text-xs">Details</TableHead>
                            <TableHead className="text-xs text-right">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedMember.withdrawals.map((w: any) => (
                            <TableRow key={w.id} className="text-xs">
                              <TableCell className="font-mono text-[11px]">
                                {new Date(w.date).toLocaleDateString()}
                              </TableCell>
                              <TableCell className="font-bold text-purple-700 dark:text-purple-400">
                                ৳{w.amount.toLocaleString()}
                              </TableCell>
                              <TableCell className="text-muted-foreground">{w.description}</TableCell>
                              <TableCell className="text-right">
                                <Badge
                                  className={
                                    w.status === 'completed'
                                      ? 'bg-emerald-500 text-white text-[10px]'
                                      : w.status === 'pending'
                                        ? 'bg-amber-500 text-white text-[10px]'
                                        : 'bg-rose-500 text-white text-[10px]'
                                  }
                                >
                                  {w.status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </TabsContent>

                {/* Tab: Deposit History */}
                <TabsContent value="deposits" className="space-y-2">
                  {selectedMember.deposits?.length === 0 ? (
                    <div className="p-6 text-center text-xs text-muted-foreground border rounded-lg bg-muted/20">
                      No deposits recorded yet.
                    </div>
                  ) : (
                    <div className="border rounded-lg overflow-x-auto max-h-56">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead className="text-xs">Date</TableHead>
                            <TableHead className="text-xs">Amount</TableHead>
                            <TableHead className="text-xs">Details</TableHead>
                            <TableHead className="text-xs text-right">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedMember.deposits.map((d: any) => (
                            <TableRow key={d.id} className="text-xs">
                              <TableCell className="font-mono text-[11px]">
                                {new Date(d.date).toLocaleDateString()}
                              </TableCell>
                              <TableCell className="font-bold text-emerald-700 dark:text-emerald-400">
                                ৳{d.amount.toLocaleString()}
                              </TableCell>
                              <TableCell className="text-muted-foreground">{d.description}</TableCell>
                              <TableCell className="text-right">
                                <Badge
                                  className={
                                    d.status === 'completed'
                                      ? 'bg-emerald-500 text-white text-[10px]'
                                      : d.status === 'pending'
                                        ? 'bg-amber-500 text-white text-[10px]'
                                        : 'bg-rose-500 text-white text-[10px]'
                                  }
                                >
                                  {d.status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-muted-foreground">
              Member details could not be loaded.
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
