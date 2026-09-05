'use client';

import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { CalendarDays, AlertTriangle, PackageX, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ExpiringBatch {
  id: string;
  productId: string;
  name: string;
  brand: string | null;
  color: string | null;
  size: string | null;
  batchNumber: string;
  expiryDate: string;
  stock: number;
}

export default function UpcomingExpiryPage() {
  const [batches, setBatches] = useState<ExpiringBatch[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUpcomingExpiry = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/products/upcoming-expiry');
      if (!response.ok) {
        throw new Error('Failed to fetch');
      }
      const data = await response.json();
      setBatches(data.batches || []);
    } catch (error) {
      console.error('Error fetching upcoming expiry:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUpcomingExpiry();
  }, []);

  const getDaysRemaining = (expiryDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const exp = new Date(expiryDate);
    const diffTime = exp.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="flex flex-col gap-4 p-4 md:p-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2.5">
            <CalendarDays className="h-7 w-7 text-amber-500" />
            Upcoming Expiry Monitoring
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track batches expiring in the next 30 days and expired inventory for prompt clearance.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchUpcomingExpiry}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block rounded-2xl border bg-card/60 backdrop-blur shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Product Name</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Variant</TableHead>
              <TableHead>Batch No</TableHead>
              <TableHead>Expiry Date</TableHead>
              <TableHead>Time Remaining</TableHead>
              <TableHead className="text-right">Stock (Pcs)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-44" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-4 w-12 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : batches.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-36 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <PackageX className="h-8 w-8 text-muted-foreground/60" />
                    <p className="font-semibold text-sm">No products expiring in the next 30 days.</p>
                    <p className="text-xs text-muted-foreground">All batch expiry dates are in good standing.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              batches.map((batch) => {
                const daysRemaining = getDaysRemaining(batch.expiryDate);
                const isExpired = daysRemaining <= 0;
                const isVerySoon = daysRemaining <= 7 && !isExpired;

                return (
                  <TableRow key={batch.id} className={isExpired ? "bg-rose-50/40 dark:bg-rose-950/10" : "hover:bg-muted/40 transition-colors"}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <span>{batch.name}</span>
                        {isExpired && (
                          <Badge className="bg-rose-600 text-white font-bold text-[9px] uppercase">
                            Expired
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs font-medium">
                      {batch.brand || '—'}
                    </TableCell>
                    <TableCell>
                      {batch.color || batch.size ? (
                        <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
                          {batch.color && <span>Color: {batch.color}</span>}
                          {batch.size && <span>Size: {batch.size}</span>}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs italic">Base Product</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono font-medium text-xs">
                        {batch.batchNumber}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {format(new Date(batch.expiryDate), 'PPP')}
                    </TableCell>
                    <TableCell>
                      {isExpired ? (
                        <Badge variant="destructive" className="flex items-center gap-1 text-[11px] font-bold">
                          <AlertTriangle className="h-3 w-3" /> Expired
                        </Badge>
                      ) : isVerySoon ? (
                        <Badge variant="destructive" className="flex items-center gap-1 text-[11px] font-bold animate-pulse">
                          <AlertTriangle className="h-3 w-3" /> {daysRemaining} days left
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[11px] bg-amber-100 text-amber-900 dark:bg-amber-950/40 dark:text-amber-300 font-semibold">
                          {daysRemaining} days left
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-extrabold text-foreground">
                      {batch.stock}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="block md:hidden space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-4 border rounded-2xl bg-card shadow-sm space-y-2">
              <Skeleton className="h-5 w-3/4 rounded" />
              <Skeleton className="h-4 w-1/2 rounded" />
            </div>
          ))
        ) : batches.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground bg-card rounded-2xl border">
            <p className="font-semibold text-sm">No products expiring in the next 30 days.</p>
          </div>
        ) : (
          batches.map((batch) => {
            const daysRemaining = getDaysRemaining(batch.expiryDate);
            const isExpired = daysRemaining <= 0;
            const isVerySoon = daysRemaining <= 7 && !isExpired;

            return (
              <div
                key={batch.id}
                className={`p-4 border rounded-2xl bg-card shadow-sm flex flex-col gap-3 ${
                  isExpired ? 'bg-rose-50/30 dark:bg-rose-950/10 border-rose-200 dark:border-rose-900/30' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-base text-foreground leading-snug">{batch.name}</h4>
                    {batch.brand && <span className="text-xs text-muted-foreground">{batch.brand}</span>}
                  </div>
                  {isExpired ? (
                    <Badge className="bg-rose-600 text-white font-bold text-[10px] uppercase shrink-0">
                      Expired
                    </Badge>
                  ) : isVerySoon ? (
                    <Badge variant="destructive" className="flex items-center gap-1 text-[10px] uppercase font-bold shrink-0 animate-pulse">
                      <AlertTriangle className="h-3 w-3" /> Urgent
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-[10px] uppercase font-bold bg-amber-100 text-amber-900 dark:bg-amber-950/40 dark:text-amber-300 shrink-0">
                      Warning
                    </Badge>
                  )}
                </div>

                <div className="border-t pt-2 space-y-1.5 text-xs text-muted-foreground">
                  <div className="flex justify-between items-center">
                    <span>Batch No:</span>
                    <Badge variant="outline" className="font-mono text-xs font-semibold">{batch.batchNumber}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Variant:</span>
                    <span className="font-medium text-foreground">
                      {batch.color || batch.size ? `${batch.color || ''} ${batch.size || ''}` : 'Base Product'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Expiry Date:</span>
                    <span className="font-medium text-foreground">{format(new Date(batch.expiryDate), 'PPP')}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t pt-2.5 bg-muted/20 p-2.5 rounded-xl text-xs">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-semibold text-muted-foreground">Status</span>
                    <span className={`font-bold text-sm ${isExpired ? 'text-rose-600' : isVerySoon ? 'text-red-600' : 'text-amber-600'}`}>
                      {isExpired ? 'Expired' : `${daysRemaining} Days Left`}
                    </span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] uppercase font-semibold text-muted-foreground">Remaining Stock</span>
                    <span className="font-extrabold text-sm text-foreground">{batch.stock} Pcs</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
