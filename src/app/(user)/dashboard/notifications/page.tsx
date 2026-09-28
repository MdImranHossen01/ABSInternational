'use client';

import { useState, useEffect } from 'react';
import {
  Bell,
  CheckCircle2,
  Clock,
  Award,
  Wallet,
  Coins,
  ShieldAlert,
  Info,
  CheckCheck
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const STORAGE_KEY = 'user_dashboard_notifications';

interface NotificationItem {
  id: number | string;
  title: string;
  message: string;
  date: string;
  type: string;
  read: boolean;
  isDemo?: boolean;
}

const DEMO_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 1,
    title: 'Global Profit Pool Distributed',
    message: 'Example preview: Monthly Global Profit pool distribution alert (Demonstration content).',
    date: '2 hours ago',
    type: 'bonus',
    read: false,
    isDemo: true,
  },
  {
    id: 2,
    title: 'New Downline Member Joined',
    message: 'Example preview: Direct downline referral registration alert (Demonstration content).',
    date: '1 day ago',
    type: 'network',
    read: false,
    isDemo: true,
  },
  {
    id: 3,
    title: 'Rank Upgrade Qualification Warning',
    message: 'Example preview: Direct downline milestone warning for Team Manager rank (Demonstration content).',
    date: '2 days ago',
    type: 'rank',
    read: true,
    isDemo: true,
  },
  {
    id: 4,
    title: 'Deposit Approved',
    message: 'Example preview: Deposit request verification and credit notification (Demonstration content).',
    date: '4 days ago',
    type: 'wallet',
    read: true,
    isDemo: true,
  },
  {
    id: 5,
    title: 'Digital Seba Card Ready',
    message: 'Example preview: Digital Seba Health Card activation notification (Demonstration content).',
    date: '1 week ago',
    type: 'seba',
    read: true,
    isDemo: true,
  },
];

export default function UserNotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>(DEMO_NOTIFICATIONS);

  useEffect(() => {
    async function initNotifications() {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setNotifications(parsed);
            return;
          }
        }

        // Attempt to fetch member-specific wallet transactions
        const res = await fetch('/api/user/wallet');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.transactions) && data.transactions.length > 0) {
            const memberNotifs: NotificationItem[] = data.transactions.slice(0, 10).map((tx: any) => ({
              id: tx._id,
              title:
                tx.type === 'deposit'
                  ? 'Deposit Transaction'
                  : tx.type === 'withdrawal'
                  ? 'Withdrawal Request'
                  : 'Wallet Balance Update',
              message: `${tx.description || tx.type}: ৳${(tx.amount || 0).toLocaleString()} (${tx.status})`,
              date: new Date(tx.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              }),
              type: tx.type === 'deposit' ? 'wallet' : tx.type === 'bonus' ? 'bonus' : 'wallet',
              read: false,
              isDemo: false,
            }));
            setNotifications(memberNotifs);
            return;
          }
        }
      } catch (e) {
        console.error('Failed to initialize notifications:', e);
      }
    }

    initNotifications();
  }, []);

  const markAllAsRead = () => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }));
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to persist notifications to localStorage:', e);
      }
      return updated;
    });
    toast.success('All notifications marked as read');
  };

  const markAsRead = (id: number | string) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to persist notification to localStorage:', e);
      }
      return updated;
    });
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'bonus':
        return <Coins className="h-4 w-4 text-emerald-600" />;
      case 'network':
        return <CheckCircle2 className="h-4 w-4 text-blue-600" />;
      case 'rank':
        return <Award className="h-4 w-4 text-amber-600" />;
      case 'wallet':
        return <Wallet className="h-4 w-4 text-purple-600" />;
      default:
        return <Info className="h-4 w-4 text-primary" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black">Notifications & Alerts</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Stay informed about your wallet earnings, rank achievements, and team activations.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={markAllAsRead} className="self-start sm:self-auto text-xs">
          <CheckCheck className="mr-1.5 h-3.5 w-3.5" /> Mark All as Read
        </Button>
      </div>

      {notifications.some((n) => n.isDemo) && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 text-xs">
          <Info className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Demonstration Content</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              The alerts below are sample previews for interface demonstration purposes only and do not reflect real account transactions or balance changes.
            </p>
          </div>
        </div>
      )}

      <Card>
        <CardContent className="p-0 divide-y">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => !notif.read && markAsRead(notif.id)}
              className={`p-4 sm:p-5 flex items-start gap-3 sm:gap-4 transition-colors ${
                !notif.read ? 'cursor-pointer hover:bg-primary/[0.06]' : ''
              } ${
                notif.read ? 'bg-card' : 'bg-primary/[0.03]'
              }`}
            >
              <div className="size-9 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
                {getIcon(notif.type)}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                      {notif.title}
                      {!notif.read && (
                        <span className="size-2 rounded-full bg-primary inline-block" />
                      )}
                    </h4>
                    {notif.isDemo && (
                      <Badge variant="outline" className="text-[10px] text-amber-800 bg-amber-100/60 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300">
                        Demonstration
                      </Badge>
                    )}
                  </div>
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1 shrink-0">
                    <Clock className="h-3 w-3" /> {notif.date}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{notif.message}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
