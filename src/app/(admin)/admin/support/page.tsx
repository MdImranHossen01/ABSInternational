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
    kyc: 'KYC & Account Verification',
    seba: 'Seba & Service Benefit',
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
        const StatusIcon = sc.icon;
        const user = selectedTicket.userId;
        return (
            <div className="space-y-4 max-w-4xl mx-auto">
                <div className="flex flex-wrap items-center gap-3">
                    <Button variant="outline" size="sm" onClick={() => setSelectedTicket(null)} className="rounded-lg gap-2">
                        <ChevronLeft className="h-4 w-4" /> All Tickets
                    </Button>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-lg font-bold truncate">{selectedTicket.subject}</h1>
                        <p className="text-xs text-muted-foreground">{categoryLabels[selectedTicket.category] ?? selectedTicket.category}</p>
                    </div>
                    {/* Status buttons */}
                    <div className="flex gap-2">
                        {(['Open', 'Processing', 'Closed'] as string[]).map(s => (
                            <button
                                key={s}
                                onClick={() => handleStatusChange(s)}
                                disabled={updatingStatus || selectedTicket.status === s}
                                className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-all ${selectedTicket.status === s ? statusConfig[s].color : 'bg-white hover:bg-muted border-gray-200 text-gray-500'}`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                {/* User info bar */}
                {user && (
                    <div className="flex items-center gap-3 bg-muted/50 rounded-xl px-4 py-2.5 border text-sm">
                        <div className="p-1.5 bg-primary/10 rounded-full">
                            <User className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                            <span className="font-semibold">{user.name}</span>
                            <span className="text-muted-foreground mx-2">·</span>
                            <span className="text-muted-foreground">{user.email}</span>
                            {user.memberId && (
                                <>
                                    <span className="text-muted-foreground mx-2">·</span>
                                    <span className="font-mono text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">ID: {user.memberId}</span>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* Chat window */}
                <Card className="border shadow-xs">
                    <CardContent className="p-0">
                        <div className="flex flex-col gap-3 p-4 h-[440px] overflow-y-auto">

                            {/* Original message */}
                            <div className="flex justify-start">
                                <div className="max-w-[80%] bg-muted border rounded-2xl rounded-tl-sm px-4 py-3 text-sm">
                                    <p className="font-semibold text-xs text-muted-foreground mb-1">👤 {user?.name ?? 'User'} (original message)</p>
                                    <p>{selectedTicket.message}</p>
                                    <p className="text-[10px] text-muted-foreground mt-1">
                                        {new Date(selectedTicket.createdAt).toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            {/* Replies */}
                            {selectedTicket.replies?.map((r: any, i: number) => (
                                <div key={i} className={`flex ${r.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm ${r.sender === 'admin'
                                        ? 'bg-primary text-primary-foreground rounded-tr-sm'
                                        : 'bg-muted border text-foreground rounded-tl-sm'}`}>
                                        <p className="font-semibold text-xs opacity-75 mb-1">
                                            {r.sender === 'admin' ? '🛡️ You (Admin)' : `👤 ${user?.name ?? 'User'}`}
                                        </p>
                                        <p>{r.message}</p>
                                        <p className={`text-[10px] opacity-60 mt-1 ${r.sender === 'admin' ? 'text-right' : 'text-left'}`}>
                                            {new Date(r.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            ))}

                            {selectedTicket.replies?.length === 0 && (
                                <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground py-10">
                                    <MessageSquare className="h-10 w-10 mb-2 opacity-30" />
                                    <p className="text-sm">No replies yet. Reply below to respond to this ticket.</p>
                                </div>
                            )}

                            <div ref={chatEndRef} />
                        </div>

                        {/* Admin Reply input */}
                        {selectedTicket.status !== 'Closed' ? (
                            <div className="border-t p-3 flex gap-2">
                                <Input
                                    placeholder="Write your admin reply..."
                                    value={replyMsg}
                                    onChange={(e) => setReplyMsg(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && !replying && handleReply()}
                                    className="rounded-full h-10"
                                />
                                <Button onClick={handleReply} disabled={replying || !replyMsg.trim()} size="icon" className="rounded-full h-10 w-10 shrink-0">
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
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight">Support Tickets</h1>
                    <p className="text-sm text-muted-foreground font-medium">Manage and reply to member support requests.</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => fetchTickets()} className="gap-2 rounded-lg">
                    <RefreshCw className="h-4 w-4" /> Refresh
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                    { key: 'all', label: 'Total', color: 'text-foreground', bg: 'bg-muted/50' },
                    { key: 'Open', label: 'Open', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
                    { key: 'Processing', label: 'Processing', color: 'text-yellow-700', bg: 'bg-yellow-50 border-yellow-200' },
                    { key: 'Closed', label: 'Closed', color: 'text-gray-600', bg: 'bg-gray-50 border-gray-200' },
                ].map(s => (
                    <button
                        key={s.key}
                        onClick={() => { setFilterStatus(s.key); fetchTickets(s.key); }}
                        className={`rounded-xl border p-4 text-left transition-all hover:shadow-sm ${s.bg} ${filterStatus === s.key ? 'ring-2 ring-primary' : ''}`}
                    >
                        <p className={`text-2xl font-black ${s.color}`}>{stats[s.key as keyof typeof stats] ?? 0}</p>
                        <p className="text-xs font-semibold text-muted-foreground mt-1">{s.label}</p>
                    </button>
                ))}
            </div>

            {/* Ticket list */}
            <Card className="border shadow-xs">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">
                        {filterStatus === 'all' ? 'All Tickets' : `${filterStatus} Tickets`}
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                    ) : tickets.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                            <MessageSquare className="h-12 w-12 mb-3 opacity-30" />
                            <p className="text-sm font-medium">No tickets found.</p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {tickets.map((ticket: any) => {
                                const sc = statusConfig[ticket.status] ?? statusConfig['Open'];
                                const StatusIcon = sc.icon;
                                const user = ticket.userId;
                                const replyCount = ticket.replies?.length ?? 0;
                                return (
                                    <button
                                        key={ticket._id}
                                        onClick={() => openTicket(ticket)}
                                        className="w-full text-left px-5 py-4 hover:bg-muted/40 transition-colors flex items-center gap-4"
                                    >
                                        <div className={`p-2 rounded-full border shrink-0 ${sc.color}`}>
                                            <StatusIcon className="h-4 w-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold truncate">{ticket.subject}</p>
                                            <p className="text-xs text-muted-foreground mt-0.5 truncate">
                                                {user?.name ?? 'Unknown'} · {user?.memberId ? `ID: ${user.memberId}` : user?.email}
                                                {' · '}{categoryLabels[ticket.category] ?? ticket.category}
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
