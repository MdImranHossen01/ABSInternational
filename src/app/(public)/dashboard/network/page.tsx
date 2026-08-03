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
  const { data: session } = useSession();
  const [network, setNetwork] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [openGen, setOpenGen] = useState<number | null>(null);

  useEffect(() => {
    async function fetchNetwork() {
      try {
        setLoading(true);
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
      }
    }
    if (session?.user) {
      fetchNetwork();
    }
  }, [session, filter]);

  const filteredDirects = network?.directTeam?.filter((member: any) => 
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    member.memberId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.phone?.includes(searchTerm)
  ) || [];

  if (loading) {
    return (
      <div className="flex justify-center p-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Downline Network</h1>
          <p className="text-sm text-muted-foreground font-medium">Manage and track your direct referrals and 10 generation matrix.</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={filter === 'all' ? 'default' : 'outline'} 
            onClick={() => setFilter('all')}
            size="sm"
            className="rounded-lg font-bold"
          >
            All
          </Button>
          <Button 
            variant={filter === 'active' ? 'default' : 'outline'} 
            onClick={() => setFilter('active')}
            size="sm"
            className="rounded-lg font-bold text-emerald-600 hover:text-emerald-700 border-emerald-500/20"
          >
            Active
          </Button>
          <Button 
            variant={filter === 'inactive' ? 'default' : 'outline'} 
            onClick={() => setFilter('inactive')}
            size="sm"
            className="rounded-lg font-bold text-red-600 hover:text-red-700 border-red-500/20"
          >
            Inactive
          </Button>
        </div>
      </div>

      <Tabs defaultValue="direct" className="w-full space-y-6">
        <TabsList className="grid grid-cols-2 max-w-sm bg-muted rounded-xl">
          <TabsTrigger value="direct" className="rounded-lg gap-2"><UserCheck className="h-4 w-4" /> Direct Team</TabsTrigger>
          <TabsTrigger value="matrix" className="rounded-lg gap-2"><Users className="h-4 w-4" /> 10 Generations</TabsTrigger>
        </TabsList>

        <TabsContent value="direct" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle>Direct Referrals (Generation 1)</CardTitle>
                <CardDescription>Members registered directly under your sponsor ID.</CardDescription>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search direct downlines..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 h-10 rounded-lg"
                />
              </div>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="matrix" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>10-Level Downline Generation Tree</CardTitle>
              <CardDescription>Browse counts and expand specific generation tiers in your matrix.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {network?.generations?.map((gen: any) => (
                <div key={gen.level} className="border rounded-xl overflow-hidden bg-white shadow-xs">
                  <button 
                    onClick={() => setOpenGen(openGen === gen.level ? null : gen.level)}
                    className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                        G{gen.level}
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-sm">Generation {gen.level}</div>
                        <div className="text-xs text-muted-foreground">{gen.members?.length || 0} Members</div>
                      </div>
                    </div>
                    {openGen === gen.level ? <ChevronDown className="h-5 w-5 text-muted-foreground" /> : <ChevronRight className="h-5 w-5 text-muted-foreground" />}
                  </button>
                  
                  {openGen === gen.level && (
                    <div className="p-4 bg-muted/10 border-t">
                      {gen.members?.length === 0 ? (
                        <div className="text-center py-6 text-xs text-muted-foreground">
                          No members in Generation {gen.level} for selected filter.
                        </div>
                      ) : (
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
