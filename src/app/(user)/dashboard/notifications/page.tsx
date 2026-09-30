'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Bell,
  CheckCircle2,
  Clock,
  Award,
  Wallet,
  Coins,
  Info,
  CheckCheck,
  Trash2,
  Loader2,
  ExternalLink,
  Inbox
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  type: 'wallet' | 'bonus' | 'network' | 'rank' | 'seba' | 'system';
  read: boolean;
  link?: string;
  createdAt: string;
}

export default function UserNotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'wallet' | 'network'>('all');
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/user/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(typeof data.unreadCount === 'number' ? data.unreadCount : 0);
      } else {
        toast.error('Failed to load notifications');
      }
    } catch (e) {
      console.error('Error fetching notifications:', e);
      toast.error('Network error loading notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAllAsRead = async () => {
    if (unreadCount === 0) return;
    try {
      setIsUpdating(true);
      const res = await fetch('/api/user/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true }),
      });

      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        setUnreadCount(0);
        toast.success('All notifications marked as read');
      } else {
        toast.error('Failed to mark all as read');
      }
    } catch {
      toast.error('Error updating notifications');
    } finally {
      setIsUpdating(false);
    }
  };

  const markAsRead = async (notif: NotificationItem) => {
    if (!notif.read) {
      try {
        setNotifications((prev) =>
          prev.map((n) => (n._id === notif._id ? { ...n, read: true } : n))
        );
        setUnreadCount((c) => Math.max(0, c - 1));

        await fetch('/api/user/notifications', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: notif._id }),
        });
      } catch (err) {
        console.error('Error marking as read:', err);
      }
    }

    if (notif.link) {
      router.push(notif.link);
    }
  };

  const deleteNotification = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/user/notifications?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setNotifications((prev) => prev.filter((n) => n._id !== id));
        toast.success('Notification removed');
      } else {
        toast.error('Failed to remove notification');
      }
    } catch {
      toast.error('Error deleting notification');
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'bonus':
        return <Coins className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />;
      case 'network':
        return <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
      case 'rank':
        return <Award className="h-4 w-4 text-amber-600 dark:text-amber-400" />;
      case 'wallet':
        return <Wallet className="h-4 w-4 text-purple-600 dark:text-purple-400" />;
      case 'seba':
        return <Award className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />;
      default:
        return <Info className="h-4 w-4 text-primary" />;
    }
  };

  const formatTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMin = Math.floor(diffMs / 60000);
      const diffHr = Math.floor(diffMin / 60);
      const diffDays = Math.floor(diffHr / 24);

      if (diffMin < 1) return 'Just now';
      if (diffMin < 60) return `${diffMin}m ago`;
      if (diffHr < 24) return `${diffHr}h ago`;
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays}d ago`;

      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return '';
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.read;
    if (filter === 'wallet') return n.type === 'wallet' || n.type === 'bonus';
    if (filter === 'network') return n.type === 'network' || n.type === 'rank';
    return true;
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black">Notifications & Alerts</h1>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="rounded-full text-xs px-2.5 py-0.5">
                {unreadCount} Unread
              </Badge>
            )}
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Real-time updates regarding your wallet, downline, rank rewards, and system notifications.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={markAllAsRead}
          disabled={unreadCount === 0 || isUpdating}
          className="self-start sm:self-auto text-xs"
        >
          {isUpdating ? (
            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
          ) : (
            <CheckCheck className="mr-1.5 h-3.5 w-3.5" />
          )}
          Mark All as Read
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <Button
          size="sm"
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
          className="text-xs rounded-full h-8"
        >
          All ({notifications.length})
        </Button>
        <Button
          size="sm"
          variant={filter === 'unread' ? 'default' : 'outline'}
          onClick={() => setFilter('unread')}
          className="text-xs rounded-full h-8"
        >
          Unread ({unreadCount})
        </Button>
        <Button
          size="sm"
          variant={filter === 'wallet' ? 'default' : 'outline'}
          onClick={() => setFilter('wallet')}
          className="text-xs rounded-full h-8"
        >
          Wallet & Bonuses
        </Button>
        <Button
          size="sm"
          variant={filter === 'network' ? 'default' : 'outline'}
          onClick={() => setFilter('network')}
          className="text-xs rounded-full h-8"
        >
          Team & Network
        </Button>
      </div>

      {/* Content */}
      {loading ? (
        <Card>
          <CardContent className="py-16 flex flex-col items-center justify-center text-muted-foreground gap-3">
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
            <p className="text-sm">Loading your notifications...</p>
          </CardContent>
        </Card>
      ) : filteredNotifications.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16 flex flex-col items-center justify-center text-center">
            <div className="size-14 rounded-full bg-muted flex items-center justify-center mb-3">
              <Inbox className="h-7 w-7 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-foreground text-base">No Notifications Found</h3>
            <p className="text-xs text-muted-foreground max-w-sm mt-1">
              {filter === 'unread'
                ? "You have caught up with all your notifications!"
                : "You don't have any notifications at the moment. As you transact and build your team, alerts will appear here."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <CardContent className="p-0 divide-y">
            {filteredNotifications.map((notif) => (
              <div
                key={notif._id}
                onClick={() => markAsRead(notif)}
                className={`group p-4 sm:p-5 flex items-start gap-3 sm:gap-4 transition-all cursor-pointer ${
                  !notif.read
                    ? 'bg-primary/[0.04] dark:bg-primary/[0.08] hover:bg-primary/[0.08]'
                    : 'bg-card hover:bg-muted/40'
                }`}
              >
                {/* Type Icon */}
                <div
                  className={`size-9 rounded-full flex items-center justify-center shrink-0 mt-0.5 border ${
                    !notif.read
                      ? 'bg-background border-primary/30 shadow-xs'
                      : 'bg-muted/50 border-transparent'
                  }`}
                >
                  {getIcon(notif.type)}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4
                        className={`text-sm tracking-tight ${
                          !notif.read ? 'font-bold text-foreground' : 'font-medium text-foreground/90'
                        }`}
                      >
                        {notif.title}
                      </h4>
                      {!notif.read && (
                        <span className="size-2 rounded-full bg-primary inline-block" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {formatTime(notif.createdAt)}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => deleteNotification(e, notif._id)}
                        className="opacity-0 group-hover:opacity-100 size-7 text-muted-foreground hover:text-destructive transition-opacity"
                        title="Delete notification"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {notif.message}
                  </p>

                  {notif.link && (
                    <div className="pt-1 flex items-center gap-1 text-[11px] font-semibold text-primary">
                      <span>View details</span>
                      <ExternalLink className="h-3 w-3" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
