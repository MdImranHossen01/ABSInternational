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
import { TrendingDown, AlertTriangle, RefreshCw, CheckCircle2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface LowStockItem {
  id: string;
  productId: string;
  slug: string;
  name: string;
  brand: string | null;
  color: string | null;
  size: string | null;
  sku: string;
  location: string;
  stock: number;
}

export default function LowStockPage() {
  const [items, setItems] = useState<LowStockItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLowStock = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/products/low-stock');
      if (!response.ok) {
        throw new Error('Failed to fetch');
      }
      const data = await response.json();
      setItems(data.items || []);
    } catch (error) {
      console.error('Error fetching low stock:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLowStock();
  }, []);

  return (
    <div className="flex flex-col gap-4 p-4 md:p-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2.5">
            <TrendingDown className="h-7 w-7 text-rose-500" />
            Low Stock Inventory Alerts
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time alert list of products and variants with critical inventory levels (&lt; 5 pcs).
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchLowStock}
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
              <TableHead>SKU</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-44" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-4 w-10 ml-auto" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-36 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                    <p className="font-semibold text-sm text-foreground">All stock levels are healthy!</p>
                    <p className="text-xs text-muted-foreground">No central warehouse items are below safety threshold (&lt; 5 pcs).</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => {
                const isCriticallyLow = item.stock <= 1;

                return (
                  <TableRow key={item.id} className="hover:bg-muted/40 transition-colors">
                    <TableCell className="font-semibold text-foreground">
                      {item.name}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs font-medium">
                      {item.brand || '—'}
                    </TableCell>
                    <TableCell>
                      {item.color || item.size ? (
                        <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
                          {item.color && <span>Color: {item.color}</span>}
                          {item.size && <span>Size: {item.size}</span>}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs italic">Base Product</span>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {item.sku}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {item.location}
                    </TableCell>
                    <TableCell>
                      {isCriticallyLow ? (
                        <Badge variant="destructive" className="flex items-center gap-1 w-fit text-[11px] font-bold animate-pulse">
                          <AlertTriangle className="h-3 w-3" /> Critical Stock
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[11px] bg-amber-100 text-amber-900 dark:bg-amber-950/40 dark:text-amber-300 font-semibold w-fit">
                          Low Stock
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-extrabold text-foreground text-sm">
                      {item.stock} Pcs
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/admin/products/${item.slug}/edit`}>
                        <Button variant="outline" size="sm" className="h-8 px-2.5">
                          <Edit className="h-3.5 w-3.5 mr-1" /> Edit
                        </Button>
                      </Link>
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
        ) : items.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground bg-card rounded-2xl border">
            <p className="font-semibold text-sm text-foreground">All stock levels are healthy!</p>
          </div>
        ) : (
          items.map((item) => {
            const isCriticallyLow = item.stock <= 1;

            return (
              <div key={item.id} className="p-4 border rounded-2xl bg-card shadow-sm flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-base text-foreground leading-snug">{item.name}</h4>
                    {item.brand && <span className="text-xs text-muted-foreground">{item.brand}</span>}
                  </div>
                  {isCriticallyLow ? (
                    <Badge variant="destructive" className="flex items-center gap-1 text-[10px] uppercase font-bold shrink-0 animate-pulse">
                      <AlertTriangle className="h-3 w-3" /> Critical
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-[10px] uppercase font-bold bg-amber-100 text-amber-900 dark:bg-amber-950/40 dark:text-amber-300 shrink-0">
                      Low Stock
                    </Badge>
                  )}
                </div>

                <div className="border-t pt-2 space-y-1.5 text-xs text-muted-foreground">
                  <div className="flex justify-between items-center">
                    <span>SKU:</span>
                    <span className="font-mono text-foreground">{item.sku}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Variant:</span>
                    <span className="font-medium text-foreground">
                      {item.color || item.size ? `${item.color || ''} ${item.size || ''}` : 'Base Product'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t pt-2.5 bg-muted/20 p-2.5 rounded-xl text-xs">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-semibold text-muted-foreground">Remaining Stock</span>
                    <span className={`font-extrabold text-sm ${isCriticallyLow ? 'text-rose-600' : 'text-amber-600'}`}>
                      {item.stock} Pcs
                    </span>
                  </div>
                  <Link href={`/admin/products/${item.slug}/edit`}>
                    <Button variant="outline" size="sm" className="h-7 text-xs">
                      <Edit className="h-3 w-3 mr-1" /> Restock
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
