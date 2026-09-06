/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';
import Image from 'next/image';
import {
  Package,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Loader2,
  ShoppingBag,
  Search,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  'Order Placed': { label: 'Order Placed', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Clock },
  'Confirmed': { label: 'Confirmed', color: 'bg-indigo-100 text-indigo-700 border-indigo-200', icon: CheckCircle2 },
  'Processing': { label: 'Processing', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Package },
  'Ready for Delivery': { label: 'Ready for Delivery', color: 'bg-orange-100 text-orange-700 border-orange-200', icon: Package },
  'Released for Delivery': { label: 'Out for Delivery', color: 'bg-purple-100 text-purple-700 border-purple-200', icon: Truck },
  'Delivered': { label: 'Delivered', color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle2 },
  'Cancelled': { label: 'Cancelled', color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle },
};

const FILTER_TABS = [
  { key: 'all', label: 'All Orders' },
  { key: 'active', label: 'Active' },
  { key: 'Delivered', label: 'Delivered' },
  { key: 'Cancelled', label: 'Cancelled' },
];

const STEPS = ['Order Placed', 'Confirmed', 'Processing', 'Ready for Delivery', 'Released for Delivery', 'Delivered'];

function OrderProgress({ status }: { status: string }) {
  const current = STEPS.indexOf(status);

  return (
    <div className="flex items-center gap-0">
      {STEPS.map((step, i) => {
        const done = i <= current;
        const isLast = i === STEPS.length - 1;
        return (
          <div key={step} className="flex items-center flex-1">
            <div
              title={step}
              className={`w-2.5 h-2.5 rounded-full shrink-0 transition-colors ${done ? 'bg-primary' : 'bg-muted-foreground/25'
                }`}
            />
            {!isLast && (
              <div
                className={`h-0.5 flex-1 transition-colors ${i < current ? 'bg-primary' : 'bg-muted-foreground/20'
                  }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function MyOrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(Array.isArray(data) ? data : []);
      } else {
        const msg = 'Failed to load orders.';
        setError(msg);
        toast.error(msg);
      }
    } catch {
      const msg = 'Network error loading orders.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/login'); return; }
    if (status !== 'authenticated') return;
    
    let isMounted = true;
    const load = async () => {
      await fetchOrders();
    };
    load();
    return () => { isMounted = false; };
  }, [status, fetchOrders]);

  const filtered = orders.filter((o) => {
    const matchesTab =
      activeTab === 'all'
        ? true
        : activeTab === 'active'
          ? !['Delivered', 'Cancelled'].includes(o.status)
          : o.status === activeTab;

    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      o._id?.toLowerCase().includes(q) ||
      o.items?.some((i: any) => i.name?.toLowerCase().includes(q));

    return matchesTab && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2">
          <Package className="h-5 w-5 sm:h-6 sm:w-6 text-primary" /> My Orders
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
          Track and manage all your orders in one place.
        </p>
      </div>

      {/* Filter tabs + Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 w-full sm:w-auto">
          <div className="flex gap-1.5 min-w-max">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors border ${activeTab === tab.key
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-muted/50 text-muted-foreground border-transparent hover:bg-muted'
                  }`}
              >
                {tab.label}
                {tab.key === 'all' && (
                  <span className="ml-1.5 bg-background text-foreground text-[10px] sm:text-xs rounded-full px-1.5 py-0.5 border">
                    {orders.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
          <Input
            placeholder="Search orders…"
            className="pl-8 sm:pl-9 h-8 sm:h-9 text-xs sm:text-sm rounded-xl"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Orders List */}
      {error ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <ShoppingBag className="h-14 w-14 text-destructive/30" />
          <div>
            <p className="font-semibold text-lg text-destructive">Error Loading Orders</p>
            <p className="text-muted-foreground text-sm mt-1">{error}</p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchOrders}>
            Try Again
          </Button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <ShoppingBag className="h-14 w-14 text-muted-foreground/30" />
          <div>
            <p className="font-semibold text-lg">No orders found</p>
            <p className="text-muted-foreground text-sm mt-1">
              {search ? 'Try a different search term.' : 'You have not placed any orders yet.'}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => router.push('/products')}>
            Browse Products
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => {
            const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG['Order Placed'];
            const Icon = cfg.icon;
            const firstItem = order.items?.[0];
            const extraCount = (order.items?.length ?? 1) - 1;
            const orderDate = order.createdAt
              ? format(new Date(order.createdAt), 'dd MMM yyyy')
              : '—';

            return (
              <Link key={order._id} href={`/dashboard/orders/${order._id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer group border">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Product image */}
                      <div className="shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-muted border relative">
                        {firstItem?.image ? (
                          <Image
                            src={firstItem.image}
                            alt={firstItem.name || 'Product'}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <Package className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      {/* Order info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="text-xs text-muted-foreground font-mono">
                            #{order._id?.slice(-8).toUpperCase()}
                          </span>
                          <Badge
                            variant="outline"
                            className={`text-[11px] font-semibold px-2 py-0.5 ${cfg.color}`}
                          >
                            <Icon className="h-3 w-3 mr-1" />
                            {cfg.label}
                          </Badge>
                        </div>

                        <p className="font-semibold text-sm truncate">
                          {firstItem?.name ?? 'Unknown Product'}
                          {extraCount > 0 && (
                            <span className="text-muted-foreground font-normal">
                              {' '}+{extraCount} more item{extraCount > 1 ? 's' : ''}
                            </span>
                          )}
                        </p>

                        <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1 text-xs text-muted-foreground">
                          <span>{orderDate}</span>
                          <span>৳{order.totalAmount?.toLocaleString()}</span>
                          {order.trackingCode && (
                            <span className="text-primary font-medium">
                              Tracking: {order.trackingCode}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Arrow */}
                      <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 group-hover:text-primary transition-colors mt-1" />
                    </div>

                    {/* Delivery Progress Bar */}
                    {order.status !== 'Cancelled' && (
                      <>
                        <Separator className="my-3" />
                        <OrderProgress status={order.status} />
                      </>
                    )}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
