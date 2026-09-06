'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
    Users, 
    UserCheck, 
    UserX, 
    ChevronDown, 
    ChevronRight, 
    Loader2, 
    Award,
    Search
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

export default function NetworkPage() {
  const { data: session, status } = useSession();
  const [network, setNetwork] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refetching, setRefetching] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [openGen, setOpenGen] = useState<number | null>(null);

  useEffect(() => {
    async function fetchNetwork() {
      try {
        if (!network) setLoading(true);
        else setRefetching(true);

        const res = await fetch(`/api/user/network?status=${filter}`);
        if (res.ok) {
          const data = await res.json();
          setNetwork(data);
        } else {
          toast.error('Failed to load network team details');
        }
      } catch (err) {
        toast.error('Connection issue');
      } finally {
        setLoading(false);
        setRefetching(false);
      }
    }

    if (status === 'authenticated' && session?.user) {
      fetchNetwork();
    } else if (status === 'unauthenticated') {
      setLoading(false);
    }
  }, [session, status, filter]);

  const filteredDirects = network?.directTeam?.filter((member: any) => {
    const term = searchTerm.toLowerCase();
    const nameMatch = (member.name || '').toLowerCase().includes(term);
    const idMatch = (member.memberId || '').toLowerCase().includes(term);
    const phoneMatch = member.phone ? member.phone.includes(searchTerm) : false;
    return nameMatch || idMatch || phoneMatch;
  }) || [];

  if (loading) {
    return (
      <div className="flex justify-center p-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-3xl font-black tracking-tight">Downline Network</h1>
          <p className="text-xs sm:text-sm text-muted-foreground font-medium">Manage and track your direct referrals and 10 generation matrix.</p>
        </div>
        <div className="flex gap-1.5 sm:gap-2">
          <Button 
            variant={filter === 'all' ? 'default' : 'outline'} 
            onClick={() => setFilter('all')}
            size="sm"
            className="rounded-lg font-bold text-xs h-8 sm:h-9"
          >
            All
          </Button>
          <Button 
            variant={filter === 'active' ? 'default' : 'outline'} 
            onClick={() => setFilter('active')}
            size="sm"
            className="rounded-lg font-bold text-xs h-8 sm:h-9 text-emerald-600 hover:text-emerald-700 border-emerald-500/20"
          >
            Active
          </Button>
          <Button 
            variant={filter === 'inactive' ? 'default' : 'outline'} 
            onClick={() => setFilter('inactive')}
            size="sm"
            className="rounded-lg font-bold text-xs h-8 sm:h-9 text-red-600 hover:text-red-700 border-red-500/20"
          >
            Inactive
          </Button>
        </div>
      </div>

      <Tabs defaultValue="direct" className="w-full space-y-4 sm:space-y-6">
        <TabsList className="grid grid-cols-2 max-w-sm bg-muted rounded-xl p-1 h-auto">
          <TabsTrigger value="direct" className="rounded-lg gap-1.5 text-xs sm:text-sm py-1.5"><UserCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Direct Team</TabsTrigger>
          <TabsTrigger value="matrix" className="rounded-lg gap-1.5 text-xs sm:text-sm py-1.5"><Users className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> 10 Generations</TabsTrigger>
        </TabsList>

        <TabsContent value="direct" className="space-y-4 sm:space-y-6">
          <Card>
            <CardHeader className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-sm sm:text-base">Direct Referrals (Generation 1)</CardTitle>
                <CardDescription className="text-xs">Members registered directly under your sponsor ID.</CardDescription>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input 
                  placeholder="Search direct downlines..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 h-8 sm:h-9 text-xs sm:text-sm rounded-lg"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0 sm:p-6 sm:pt-0">
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Rank</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDirects.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                          No direct referrals found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredDirects.map((member: any) => (
                        <TableRow key={member.memberId}>
                          <TableCell className="font-mono text-xs font-bold">{member.memberId}</TableCell>
                          <TableCell className="font-bold">{member.name}</TableCell>
                          <TableCell className="text-xs space-y-0.5">
                            <div>{member.phone || 'No phone'}</div>
                            <div className="text-muted-foreground">{member.email}</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize gap-1.5"><Award className="h-3 w-3 text-primary" /> {member.rank || 'user'}</Badge>
                          </TableCell>
                          <TableCell>
                            {member.isSubscriptionActive ? (
                              <Badge className="bg-emerald-500 text-white font-bold gap-1"><UserCheck className="h-3 w-3" /> Active</Badge>
                            ) : (
                              <Badge className="bg-slate-300 text-slate-800 font-bold gap-1"><UserX className="h-3 w-3" /> Inactive</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards View */}
              <div className="md:hidden divide-y divide-slate-100">
                {filteredDirects.length === 0 ? (
                  <div className="p-8 text-center text-xs text-muted-foreground">No direct referrals found.</div>
                ) : (
                  filteredDirects.map((member: any) => (
                    <div key={member.memberId} className="p-4 space-y-2.5 bg-white hover:bg-slate-50/50">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-bold text-sm text-slate-900">{member.name}</p>
                          <p className="font-mono text-xs text-primary font-bold">{member.memberId}</p>
                        </div>
                        {member.isSubscriptionActive ? (
                          <Badge className="bg-emerald-500 text-white text-[10px] font-bold py-0.5 px-2">Active</Badge>
                        ) : (
                          <Badge className="bg-slate-300 text-slate-800 text-[10px] font-bold py-0.5 px-2">Inactive</Badge>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-xs bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <div className="text-slate-600">
                          {member.phone && <p>{member.phone}</p>}
                          <p className="text-[11px] text-muted-foreground truncate max-w-[180px]">{member.email}</p>
                        </div>
                        <Badge variant="outline" className="capitalize text-[10px] gap-1 shrink-0">
                          <Award className="h-3 w-3 text-primary" /> {member.rank || 'user'}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="matrix" className="space-y-4 sm:space-y-6">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-sm sm:text-base">10-Level Downline Generation Tree</CardTitle>
              <CardDescription className="text-xs">Browse counts and expand specific generation tiers in your matrix.</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0 space-y-3">
              {network?.generations?.map((gen: any) => (
                <div key={gen.level} className="border rounded-xl overflow-hidden bg-white shadow-xs">
                  <button 
                    onClick={() => setOpenGen(openGen === gen.level ? null : gen.level)}
                    className="w-full flex items-center justify-between p-3 sm:p-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 sm:gap-3">
                      <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs sm:text-sm">
                        G{gen.level}
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-xs sm:text-sm">Generation {gen.level}</div>
                        <div className="text-[11px] text-muted-foreground">{gen.members?.length || 0} Members</div>
                      </div>
                    </div>
                    {openGen === gen.level ? <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />}
                  </button>
                  
                  {openGen === gen.level && (
                    <div className="p-3 sm:p-4 bg-muted/10 border-t">
                      {gen.members?.length === 0 ? (
                        <div className="text-center py-4 text-xs text-muted-foreground">
                          No members in Generation {gen.level} for selected filter.
                        </div>
                      ) : (
                        <div>
                          {/* Desktop Sub-table */}
                          <div className="hidden md:block overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow className="bg-transparent hover:bg-transparent">
                                  <TableHead>Member ID</TableHead>
                                  <TableHead>Name</TableHead>
                                  <TableHead>Sponsor ID</TableHead>
                                  <TableHead>Rank</TableHead>
                                  <TableHead>Status</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {gen.members.map((member: any) => (
                                  <TableRow key={member.memberId}>
                                    <TableCell className="font-mono text-xs font-bold">{member.memberId}</TableCell>
                                    <TableCell className="font-bold text-xs">{member.name}</TableCell>
                                    <TableCell className="font-mono text-xs text-muted-foreground">{member.sponsorId || 'None'}</TableCell>
                                    <TableCell className="text-xs capitalize">{member.rank}</TableCell>
                                    <TableCell>
                                      {member.isSubscriptionActive ? (
                                        <Badge className="bg-emerald-500 text-white text-[10px] py-0.5 px-2">Active</Badge>
                                      ) : (
                                        <Badge className="bg-slate-300 text-slate-800 text-[10px] py-0.5 px-2">Inactive</Badge>
                                      )}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>

                          {/* Mobile Sub-cards */}
                          <div className="md:hidden space-y-2">
                            {gen.members.map((member: any) => (
                              <div key={member.memberId} className="p-3 bg-white rounded-lg border border-slate-200/80 space-y-1.5">
                                <div className="flex items-center justify-between">
                                  <p className="font-bold text-xs text-slate-900">{member.name}</p>
                                  {member.isSubscriptionActive ? (
                                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">Active</span>
                                  ) : (
                                    <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-1.5 py-0.5 rounded">Inactive</span>
                                  )}
                                </div>
                                <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                                  <span>ID: {member.memberId}</span>
                                  <span>Sponsor: {member.sponsorId || 'None'}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
