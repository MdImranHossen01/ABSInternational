'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
    HelpCircle, 
    MessageSquare, 
    ChevronRight, 
    Loader2, 
    CheckCircle2,
    Calendar,
    Send
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import Swal from 'sweetalert2';

export default function SupportPage() {
  const { data: session } = useSession();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('deposit');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function fetchTickets() {
    try {
      const res = await fetch('/api/user/support');
      if (res.ok) setTickets(await res.json());
    } catch (err) {
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (session?.user) {
      fetchTickets();
    }
  }, [session]);

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !message) {
      toast.error('Subject and message are required.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/user/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, category, message })
      });
      const data = await res.json();
      if (res.ok) {
        Swal.fire({
          title: 'Ticket Submitted',
          text: data.message,
          icon: 'success',
          confirmButtonColor: 'var(--primary)'
        });
        setSubject('');
        setMessage('');
        fetchTickets();
      } else {
        toast.error(data.message || 'Submission failed');
      }
    } catch (err) {
      toast.error('Network issue');
    } finally {
      setSubmitting(false);
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
      <div>
        <h1 className="text-3xl font-black tracking-tight">Support Ticket System</h1>
        <p className="text-sm text-muted-foreground font-medium">Create support inquiries, upload files, and chat directly with administrators.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Create Ticket */}
        <Card className="lg:col-span-1 border shadow-xs bg-white">
          <CardHeader>
            <CardTitle>Create Ticket</CardTitle>
            <CardDescription>Open a query to get support from ABS helpdesk.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitTicket} className="space-y-4">
              <div className="space-y-2">
                <Label>Query Category</Label>
                <select 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-11 rounded-lg border px-3 text-sm outline-none focus:border-primary transition-all bg-white"
                >
                  <option value="deposit">Deposit Issues</option>
                  <option value="withdrawal">Withdrawal Issues</option>
                  <option value="commission">MLM Bonus & Commission</option>
                  <option value="kyc">KYC & Account verification</option>
                  <option value="seba">Seba & Service Benefit</option>
                  <option value="others">Others</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label>Subject</Label>
                <Input 
                  placeholder="Summarize your issue" 
                  value={subject} 
                  onChange={(e) => setSubject(e.target.value)}
                  className="h-11 rounded-lg"
                />
              </div>

              <div className="space-y-2">
                <Label>Detail Description</Label>
                <textarea 
                  value={message} 
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Explain your problem in detail..."
                  className="w-full h-32 rounded-lg border p-3 text-sm outline-none focus:border-primary resize-none"
                />
              </div>

              <Button 
                type="submit" 
                disabled={submitting} 
                className="w-full h-11 font-bold rounded-lg"
              >
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Support Ticket
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Ticket history */}
        <Card className="lg:col-span-2 border shadow-xs bg-white">
          <CardHeader>
            <CardTitle>Your Support History</CardTitle>
            <CardDescription>View status of your previous tickets and read responses.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-10 text-muted-foreground text-xs font-medium">
                      No support tickets submitted.
                    </TableCell>
                  </TableRow>
                ) : (
                  tickets.map((ticket: any) => (
                    <TableRow key={ticket._id}>
                      <TableCell className="text-xs">{new Date(ticket.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="capitalize text-xs font-bold">{ticket.category}</TableCell>
                      <TableCell className="text-xs font-medium max-w-xs truncate">{ticket.subject}</TableCell>
                      <TableCell>
                        <Badge variant={ticket.status === 'Open' ? 'outline' : ticket.status === 'Closed' ? 'secondary' : 'default'} className="text-[10px] capitalize">
                          {ticket.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
