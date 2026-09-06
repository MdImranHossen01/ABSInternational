'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import {
    HelpCircle,
    MessageSquare,
    Loader2,
    Send,
    ChevronLeft,
    Clock,
    CheckCircle2,
    AlertCircle,
    X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import Swal from 'sweetalert2';

const categoryLabels: Record<string, string> = {
    deposit: 'Deposit Issues',
    withdrawal: 'Withdrawal Issues',
    commission: 'MLM Bonus & Commission',
    kyc: 'KYC & Account Verification',
    seba: 'Seba & Service Benefit',
    others: 'Others',
};

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
    Open: { label: 'Open', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: AlertCircle },
    Processing: { label: 'Processing', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Clock },
    Closed: { label: 'Closed', color: 'bg-gray-100 text-gray-600 border-gray-200', icon: CheckCircle2 },
};

export default function SupportPage() {
    const { data: session } = useSession();
    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [subject, setSubject] = useState('');
    const [category, setCategory] = useState('deposit');
    const [message, setMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
    const [replyMsg, setReplyMsg] = useState('');
    const [replying, setReplying] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    async function fetchTickets() {
        try {
            const res = await fetch('/api/user/support');
            if (res.ok) setTickets(await res.json());
        } catch {
            toast.error('Failed to load tickets');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (session?.user) fetchTickets();
    }, [session]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [selectedTicket?.replies]);

    const handleSubmitTicket = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!subject || !message) { toast.error('Subject and message are required.'); return; }
        setSubmitting(true);
        try {
            const res = await fetch('/api/user/support', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subject, category, message })
            });
            const data = await res.json();
            if (res.ok) {
                Swal.fire({ title: 'Ticket Submitted!', text: data.message, icon: 'success', confirmButtonColor: 'var(--primary)' });
                setSubject(''); setMessage('');
                await fetchTickets();
            } else {
                toast.error(data.message || 'Submission failed');
            }
        } catch { toast.error('Network issue'); }
        finally { setSubmitting(false); }
    };

    const openTicket = async (ticket: any) => {
        // refresh latest data
        const res = await fetch('/api/user/support');
        if (res.ok) {
            const all = await res.json();
            const fresh = all.find((t: any) => t._id === ticket._id) || ticket;
            setSelectedTicket(fresh);
        } else {
            setSelectedTicket(ticket);
        }
    };

    const handleReply = async () => {
        if (!replyMsg.trim()) return;
        setReplying(true);
        try {
            const res = await fetch('/api/user/support', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ticketId: selectedTicket._id, replyMessage: replyMsg })
            });
            const data = await res.json();
            if (res.ok) {
                setReplyMsg('');
                setSelectedTicket(data.ticket);
                await fetchTickets();
            } else {
                toast.error(data.message || 'Failed to send reply');
            }
        } catch { toast.error('Network error'); }
        finally { setReplying(false); }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center p-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    // ── TICKET CHAT VIEW ──────────────────────────────────────────────────────
    if (selectedTicket) {
        const sc = statusConfig[selectedTicket.status] ?? statusConfig['Open'];
        const StatusIcon = sc.icon;
        return (
            <div className="space-y-4 max-w-3xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2.5">
                        <Button variant="outline" size="sm" onClick={() => setSelectedTicket(null)} className="rounded-lg gap-1.5 h-8 text-xs">
                            <ChevronLeft className="h-3.5 w-3.5" /> Back
                        </Button>
                        <div className="min-w-0">
                            <h1 className="text-base sm:text-lg font-bold truncate">{selectedTicket.subject}</h1>
                            <p className="text-[11px] text-muted-foreground">{categoryLabels[selectedTicket.category] ?? selectedTicket.category}</p>
                        </div>
                    </div>
                    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border self-start sm:self-auto ${sc.color}`}>
                        <StatusIcon className="h-3 w-3" />
                        {sc.label}
                    </span>
                </div>

                {/* Chat window */}
                <Card className="border shadow-xs">
                    <CardContent className="p-0">
                        <div className="flex flex-col gap-3 p-3 sm:p-4 h-[400px] sm:h-[460px] overflow-y-auto">

                            {/* Original message */}
                            <div className="flex justify-end">
                                <div className="max-w-[85%] sm:max-w-[80%] bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-3.5 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm shadow-sm">
                                    <p className="font-semibold text-[10px] sm:text-xs opacity-75 mb-1">You (original)</p>
                                    <p>{selectedTicket.message}</p>
                                    <p className="text-[9px] sm:text-[10px] opacity-60 mt-1 text-right">
                                        {new Date(selectedTicket.createdAt).toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            {/* Replies */}
                            {selectedTicket.replies?.map((r: any, i: number) => (
                                <div key={i} className={`flex ${r.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] sm:max-w-[80%] rounded-2xl px-3.5 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm shadow-sm ${r.sender === 'user'
                                        ? 'bg-primary text-primary-foreground rounded-tr-sm'
                                        : 'bg-muted text-foreground rounded-tl-sm border'
                                        }`}>
                                        <p className="font-semibold text-[10px] sm:text-xs opacity-75 mb-1">
                                            {r.sender === 'admin' ? '🛡️ ABS Support' : 'You'}
                                        </p>
                                        <p>{r.message}</p>
                                        <p className={`text-[9px] sm:text-[10px] opacity-60 mt-1 ${r.sender === 'user' ? 'text-right' : 'text-left'}`}>
                                            {new Date(r.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            ))}

                            {selectedTicket.replies?.length === 0 && (
                                <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground py-10">
                                    <MessageSquare className="h-8 w-8 sm:h-10 sm:w-10 mb-2 opacity-30" />
                                    <p className="text-xs sm:text-sm">No replies yet. Our team will respond shortly.</p>
                                </div>
                            )}

                            <div ref={chatEndRef} />
                        </div>

                        {/* Reply input */}
                        {selectedTicket.status !== 'Closed' ? (
                            <div className="border-t p-2.5 sm:p-3 flex gap-2">
                                <Input
                                    placeholder="Write your reply..."
                                    value={replyMsg}
                                    onChange={(e) => setReplyMsg(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && !replying && handleReply()}
                                    className="rounded-full h-9 sm:h-10 text-xs sm:text-sm"
                                />
                                <Button onClick={handleReply} disabled={replying || !replyMsg.trim()} size="icon" className="rounded-full h-9 w-9 sm:h-10 sm:w-10 shrink-0">
                                    {replying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
                                </Button>
                            </div>
                        ) : (
                            <div className="border-t p-3 text-center text-xs text-muted-foreground font-medium">
                                ✅ This ticket is closed. Open a new ticket if you need further help.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        );
    }

    // ── TICKET LIST + CREATE FORM ─────────────────────────────────────────────
    return (
        <div className="space-y-4 sm:space-y-6">
            <div>
                <h1 className="text-xl sm:text-3xl font-black tracking-tight">Support Tickets</h1>
                <p className="text-xs sm:text-sm text-muted-foreground font-medium">Create support inquiries and chat directly with administrators.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">

                {/* Create Ticket */}
                <Card className="lg:col-span-1 border shadow-xs bg-white">
                    <CardHeader className="p-4 sm:p-6">
                        <CardTitle className="text-base sm:text-lg">Create Ticket</CardTitle>
                        <CardDescription className="text-xs">Open a query to get support from ABS helpdesk.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
                        <form onSubmit={handleSubmitTicket} className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-xs sm:text-sm">Query Category</Label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full h-10 sm:h-11 rounded-lg border px-3 text-xs sm:text-sm outline-none focus:border-primary transition-all bg-white"
                                >
                                    <option value="deposit">Deposit Issues</option>
                                    <option value="withdrawal">Withdrawal Issues</option>
                                    <option value="commission">MLM Bonus &amp; Commission</option>
                                    <option value="kyc">KYC &amp; Account Verification</option>
                                    <option value="seba">Seba &amp; Service Benefit</option>
                                    <option value="others">Others</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs sm:text-sm">Subject</Label>
                                <Input
                                    placeholder="Summarize your issue"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    className="h-10 sm:h-11 rounded-lg text-xs sm:text-sm"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs sm:text-sm">Detail Description</Label>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Explain your problem in detail..."
                                    className="w-full h-24 sm:h-32 rounded-lg border p-3 text-xs sm:text-sm outline-none focus:border-primary resize-none"
                                />
                            </div>

                            <Button type="submit" disabled={submitting} className="w-full h-10 sm:h-11 font-bold rounded-lg gap-2 text-xs sm:text-sm">
                                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
                                Submit Support Ticket
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Ticket List */}
                <Card className="lg:col-span-2 border shadow-xs bg-white">
                    <CardHeader className="p-4 sm:p-6">
                        <CardTitle className="text-base sm:text-lg">Your Tickets</CardTitle>
                        <CardDescription className="text-xs">Click on a ticket to view replies and respond.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        {tickets.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-muted-foreground">
                                <HelpCircle className="h-10 w-10 sm:h-12 sm:w-12 mb-3 opacity-30" />
                                <p className="text-xs sm:text-sm font-medium">No support tickets submitted.</p>
                            </div>
                        ) : (
                            <div className="divide-y">
                                {tickets.map((ticket: any) => {
                                    const sc = statusConfig[ticket.status] ?? statusConfig['Open'];
                                    const StatusIcon = sc.icon;
                                    const unreadAdmin = ticket.replies?.filter((r: any) => r.sender === 'admin').length ?? 0;
                                    return (
                                        <button
                                            key={ticket._id}
                                            onClick={() => openTicket(ticket)}
                                            className="w-full text-left p-3.5 sm:px-5 sm:py-4 hover:bg-muted/50 transition-colors flex items-center gap-3 sm:gap-4"
                                        >
                                            <div className={`p-2 rounded-full ${sc.color} border shrink-0`}>
                                                <StatusIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs sm:text-sm font-semibold truncate">{ticket.subject}</p>
                                                <p className="text-[11px] text-muted-foreground mt-0.5">
                                                    {categoryLabels[ticket.category] ?? ticket.category} · {new Date(ticket.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className="flex flex-col items-end gap-1 shrink-0">
                                                <span className={`text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full border ${sc.color}`}>{sc.label}</span>
                                                {unreadAdmin > 0 && (
                                                    <span className="text-[9px] sm:text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full font-bold">
                                                        {unreadAdmin} reply
                                                    </span>
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>

            </div>
        </div>
    );
}
