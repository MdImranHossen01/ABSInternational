'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  Award,
  Trophy,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  Landmark
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';

export default function RankSystemPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRanks() {
      try {
        const res = await fetch('/api/user/ranks');
        if (res.ok) {
          setData(await res.json());
        } else {
          toast.error('Failed to load rank system matrix');
        }
      } catch (err) {
        toast.error('Failed to load rank system matrix');
      } finally {
        setLoading(false);
      }
    }
    if (session?.user) loadRanks();
  }, [session]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-xs text-muted-foreground font-semibold">Loading Rank System Rules...</p>
        </div>
      </div>
    );
  }

  const ranksMaster = data?.ranksMaster || [];
  const currentRank = data?.currentRank || 'user';

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-linear-to-r from-amber-600 via-orange-600 to-primary p-6 text-white shadow-lg">
        <h1 className="text-2xl sm:text-3xl font-black">Rank System & Matrix Criteria</h1>
        <p className="text-xs sm:text-sm opacity-90 mt-1 max-w-2xl">
          Official career progression rules of ABS International. Understand the exact downline criteria and promotion requirements for each leadership tier.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-600" /> Rank Qualification Matrix
          </CardTitle>
          <CardDescription>Rules to achieve Team Manager through Company Director</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-bold">Rank Tier</TableHead>
                  <TableHead className="font-bold">Requirements</TableHead>
                  <TableHead className="font-bold">Cash Promotion Bonus</TableHead>
                  <TableHead className="font-bold">Incentives & Rewards</TableHead>
                  <TableHead className="font-bold text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ranksMaster.map((r: any) => (
                  <TableRow key={r.id} className={currentRank === r.id ? 'bg-primary/5 font-semibold' : ''}>
                    <TableCell className="font-bold flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-amber-600 shrink-0" />
                      {r.title}
                    </TableCell>
                    <TableCell className="text-xs">{r.requirement}</TableCell>
                    <TableCell className="font-mono font-bold text-emerald-600">
                      {r.bonus > 0 ? `৳${r.bonus.toLocaleString()}` : '—'}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{r.reward}</TableCell>
                    <TableCell className="text-center">
                      {currentRank === r.id ? (
                        <Badge className="bg-primary text-white font-bold text-[10px]">Your Rank</Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px]">Standard</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
