'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import {
    Loader2,
    Send,
    ChevronLeft,
    Clock,
    CheckCircle2,
    AlertCircle,
    MessageSquare,
    RefreshCw,
    User,
    Filter,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const categoryLabels: Record<string, string> = {
    deposit: 'Deposit Issues',
    withdrawal: 'Withdrawal Issues',
    commission: 'MLM Bonus & Commission',
    kyc: 'KYC & Verification',
    seba: 'Seba Benefit',
    others: 'Others',
};

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
    Open: { label: 'Open', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: AlertCircle },
    Processing: { label: 'Processing', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Clock },
    Closed: { label: 'Closed', color: 'bg-gray-100 text-gray-600 border-gray-200', icon: CheckCircle2 },
};

export default function AdminSupportPage() {
    const { data: session } = useSession();
    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
    const [replyMsg, setReplyMsg] = useState('');
    const [replying, setReplying] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    async function fetchTickets(status = filterStatus) {
        setLoading(true);
        try {
            const url = status === 'all' ? '/api/admin/support' : `/api/admin/support?status=${status}`;
            const res = await fetch(url);
            if (res.ok) setTickets(await res.json());
            else toast.error('Failed to load tickets');
        } catch { toast.error('Network error'); }
        finally { setLoading(false); }
    }

    useEffect(() => { if (session?.user) fetchTickets(); }, [session]);
    useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [selectedTicket?.replies]);

    const openTicket = async (ticket: any) => {
        const res = await fetch(`/api/admin/support/${ticket._id}`);
        if (res.ok) setSelectedTicket(await res.json());
        else setSelectedTicket(ticket);
    };

    const handleReply = async () => {
        if (!replyMsg.trim()) return;
        setReplying(true);
        try {
            const res = await fetch(`/api/admin/support/${selectedTicket._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ replyMessage: replyMsg })
            });
            const data = await res.json();
            if (res.ok) {
                setReplyMsg('');
                setSelectedTicket(data.ticket);
                fetchTickets();
                toast.success('Reply sent!');
            } else { toast.error(data.message); }
        } catch { toast.error('Network error'); }
        finally { setReplying(false); }
    };

    const handleStatusChange = async (newStatus: string) => {
        setUpdatingStatus(true);
        try {
            const res = await fetch(`/api/admin/support/${selectedTicket._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            const data = await res.json();
            if (res.ok) {
                setSelectedTicket(data.ticket);
                fetchTickets();
                toast.success(`Status updated to ${newStatus}`);
            } else { toast.error(data.message); }
        } catch { toast.error('Network error'); }
        finally { setUpdatingStatus(false); }
    };

    const stats = {
        all: tickets.length,
        Open: tickets.filter(t => t.status === 'Open').length,
        Processing: tickets.filter(t => t.status === 'Processing').length,
        Closed: tickets.filter(t => t.status === 'Closed').length,
    };

    // ── TICKET CHAT (ADMIN VIEW) ───────────────────────────────────────────────
    if (selectedTicket) {
        const sc = statusConfig[selectedTicket.status] ?? statusConfig['Open'];
        const user = selectedTicket.userId;
        return (
            <div className="space-y-4 max-w-4xl mx-auto px-1 sm:px-4 mt-2 md:mt-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <Button variant="outline" size="sm" onClick={() => setSelectedTicket(null)} className="rounded-xl gap-1 text-xs h-9">
                        <ChevronLeft className="h-4 w-4" /> Back to Tickets
                    </Button>
                    {/* Status buttons */}
                    <div className="flex gap-1.5 overflow-x-auto">
                        {(['Open', 'Processing', 'Closed'] as string[]).map(s => (
                            <button
                                key={s}
                                onClick={() => handleStatusChange(s)}
                                disabled={updatingStatus || selectedTicket.status === s}
                                className={`text-[11px] font-bold px-2.5 py-1 rounded-full border transition-all ${selectedTicket.status === s ? statusConfig[s].color : 'bg-white hover:bg-muted border-gray-200 text-gray-500'}`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-white p-3 rounded-2xl border shadow-xs">
                    <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">{selectedTicket.subject}</h1>
                    <p className="text-xs text-primary font-medium mt-0.5">{categoryLabels[selectedTicket.category] ?? selectedTicket.category}</p>
                </div>

                {/* User info bar */}
                {user && (
                    <div className="flex flex-wrap items-center gap-2 bg-slate-50 rounded-xl px-3 py-2 border text-xs text-slate-700">
                        <div className="p-1 bg-primary/10 rounded-full text-primary">
                            <User className="h-3.5 w-3.5" />
                        </div>
                        <span className="font-bold">{user.name}</span>
                        <span className="text-muted-foreground">·</span>
                        <span className="text-muted-foreground">{user.email}</span>
                        {user.memberId && (
                            <>
                                <span className="text-muted-foreground">·</span>
                                <span className="font-mono text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">ID: {user.memberId}</span>
                            </>
                        )}
                    </div>
                )}

                {/* Chat window */}
                <Card className="border shadow-xs">
                    <CardContent className="p-0">
                        <div className="flex flex-col gap-3 p-3 sm:p-4 h-[380px] sm:h-[440px] overflow-y-auto">

                            {/* Original message */}
                            <div className="flex justify-start">
                                <div className="max-w-[85%] sm:max-w-[80%] bg-muted border rounded-2xl rounded-tl-sm px-3.5 py-2.5 text-xs sm:text-sm">
                                    <p className="font-semibold text-[11px] text-muted-foreground mb-1">👤 {user?.name ?? 'User'} (original query)</p>
                                    <p className="leading-relaxed">{selectedTicket.message}</p>
                                    <p className="text-[9px] text-muted-foreground mt-1 text-right">
                                        {new Date(selectedTicket.createdAt).toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            {/* Replies */}
                            {selectedTicket.replies?.map((r: any, i: number) => (
                                <div key={i} className={`flex ${r.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] sm:max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm shadow-xs ${r.sender === 'admin'
                                        ? 'bg-primary text-primary-foreground rounded-tr-sm'
                                        : 'bg-muted border text-foreground rounded-tl-sm'}`}>
                                        <p className="font-semibold text-[11px] opacity-75 mb-1">
                                            {r.sender === 'admin' ? '🛡️ You (Admin)' : `👤 ${user?.name ?? 'User'}`}
                                        </p>
                                        <p className="leading-relaxed">{r.message}</p>
                                        <p className={`text-[9px] opacity-60 mt-1 ${r.sender === 'admin' ? 'text-right' : 'text-left'}`}>
                                            {new Date(r.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            ))}

                            {selectedTicket.replies?.length === 0 && (
                                <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground py-10">
                                    <MessageSquare className="h-8 w-8 mb-2 opacity-30" />
                                    <p className="text-xs">No replies yet. Type reply below.</p>
                                </div>
                            )}

                            <div ref={chatEndRef} />
                        </div>

                        {/* Admin Reply input */}
                        {selectedTicket.status !== 'Closed' ? (
                            <div className="border-t p-2.5 sm:p-3 flex gap-2">
                                <Input
                                    placeholder="Write your response..."
                                    value={replyMsg}
                                    onChange={(e) => setReplyMsg(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && !replying && handleReply()}
                                    className="rounded-xl h-10 text-xs sm:text-sm"
                                />
                                <Button onClick={handleReply} disabled={replying || !replyMsg.trim()} size="icon" className="rounded-xl h-10 w-10 shrink-0">
                                    {replying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                </Button>
                            </div>
                        ) : (
                            <div className="border-t p-3 text-center text-xs text-muted-foreground font-medium">
                                This ticket is closed. Change status to reply.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        );
    }

    // ── TICKET LIST ───────────────────────────────────────────────────────────
    return (
        <div className="space-y-4 md:space-y-6 mt-2 md:mt-4 max-w-7xl mx-auto px-1 sm:px-4">
            <div className="flex items-center justify-between gap-2">
                <div>
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-slate-900">Support Desk</h1>
                    <p className="text-xs sm:text-sm text-muted-foreground font-medium mt-0.5">Manage and respond to customer queries.</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => fetchTickets()} className="gap-1.5 rounded-xl h-9 text-xs">
                    <RefreshCw className="h-3.5 w-3.5" /> Refresh
                </Button>
            </div>

            {/* Stats Filter Buttons */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
                {[
                    { key: 'all', label: 'Total', color: 'text-foreground', bg: 'bg-muted/50' },
                    { key: 'Open', label: 'Open', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
                    { key: 'Processing', label: 'Processing', color: 'text-yellow-700', bg: 'bg-yellow-50 border-yellow-200' },
                    { key: 'Closed', label: 'Closed', color: 'text-gray-600', bg: 'bg-gray-50 border-gray-200' },
                ].map(s => (
                    <button
                        key={s.key}
                        onClick={() => { setFilterStatus(s.key); fetchTickets(s.key); }}
                        className={`rounded-xl border p-3 sm:p-4 text-left transition-all hover:shadow-xs ${s.bg} ${filterStatus === s.key ? 'ring-2 ring-primary' : ''}`}
                    >
                        <p className={`text-xl sm:text-2xl font-black ${s.color}`}>{stats[s.key as keyof typeof stats] ?? 0}</p>
                        <p className="text-[11px] sm:text-xs font-semibold text-muted-foreground mt-0.5">{s.label}</p>
                    </button>
                ))}
            </div>

            {/* Ticket list Card Container */}
            <Card className="shadow-sm border">
                <CardHeader className="p-4 sm:p-6 border-b">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-base sm:text-lg font-bold">
                                {filterStatus === 'all' ? 'All Tickets' : `${filterStatus} Tickets`}
                            </CardTitle>
                            <CardDescription className="text-xs">Click on any ticket to open chat conversation</CardDescription>
                        </div>
                        <Badge variant="secondary" className="font-bold text-xs px-2.5 py-1">
                            Count: {tickets.length}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                    ) : tickets.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                            <MessageSquare className="h-10 w-10 mb-2 opacity-30" />
                            <p className="text-xs sm:text-sm font-medium">No tickets found in this filter.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {tickets.map((ticket: any) => {
                                const sc = statusConfig[ticket.status] ?? statusConfig['Open'];
                                const StatusIcon = sc.icon;
                                const user = ticket.userId;
                                const replyCount = ticket.replies?.length ?? 0;
                                return (
                                    <button
                                        key={ticket._id}
                                        onClick={() => openTicket(ticket)}
                                        className="w-full text-left p-3.5 sm:p-4 hover:bg-slate-50 transition-colors flex items-start sm:items-center gap-3"
                                    >
                                        <div className={`p-2 rounded-xl border shrink-0 mt-0.5 sm:mt-0 ${sc.color}`}>
                                            <StatusIcon className="h-4 w-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">{ticket.subject}</p>
                                            <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 truncate">
                                                {user?.name ?? 'Unknown'} · {user?.memberId ? `ID: ${user.memberId}` : user?.email}
                                                {' · '}<span className="text-primary font-medium">{categoryLabels[ticket.category] ?? ticket.category}</span>
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-end gap-1 shrink-0">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${sc.color}`}>{sc.label}</span>
                                            <span className="text-[10px] text-muted-foreground">{replyCount} repl{replyCount === 1 ? 'y' : 'ies'}</span>
                                            <span className="text-[10px] text-muted-foreground">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
