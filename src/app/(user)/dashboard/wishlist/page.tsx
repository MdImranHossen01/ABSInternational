'use client';

import { useState, useEffect } from 'react';
import { useAppSelector } from '@/store/hooks';
import { ProductCard } from '@/components/storefront/ProductCard';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Heart, Loader2, ShoppingBag } from 'lucide-react';
import { useSession } from 'next-auth/react';

export default function WishlistPage() {
  const { status } = useSession();
  const wishlistIds = useAppSelector((state) => state.wishlist.items);
  const isHydrated = useAppSelector((state) => state.wishlist.isHydrated);

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isHydrated || status === 'loading') return;

    const controller = new AbortController();
    let isMounted = true;

    async function fetchWishlistProducts() {
      setLoading(true);
      try {
        let url = '';
        if (status === 'authenticated') {
          url = '/api/wishlist';
        } else if (wishlistIds.length > 0) {
          url = `/api/products?ids=${wishlistIds.join(',')}`;
        }

        if (url) {
          const res = await fetch(url, { signal: controller.signal });
          if (res.ok) {
            const data = await res.json();
            const productsArray = data.products || data;
            if (isMounted) setProducts(Array.isArray(productsArray) ? productsArray : []);
          } else {
            throw new Error(`Failed to fetch: ${res.status}`);
          }
        } else {
          if (isMounted) setProducts([]);
        }
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          console.error('Error fetching wishlist products:', error);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchWishlistProducts();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [wishlistIds, isHydrated, status]);

  if (!isHydrated || (loading && products.length === 0)) {
    return (
      <div className="flex h-[40vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Loading your wishlist...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-3xl font-bold tracking-tight mb-0.5 sm:mb-1 flex items-center gap-2 sm:gap-3">
            <Heart className="h-6 w-6 sm:h-8 sm:w-8 text-destructive fill-destructive" />
            My Wishlist
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm">
            {products.length === 0
              ? "Your wishlist is empty."
              : `You have ${products.length} item${products.length === 1 ? '' : 's'} in your wishlist.`}
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="h-9 text-xs sm:text-sm w-full sm:w-auto">
          <Link href="/shop">Continue Shopping</Link>
        </Button>
      </div>

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 sm:py-20 bg-muted/20 rounded-2xl sm:rounded-3xl border-2 border-dashed p-4">
          <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-muted flex items-center justify-center mb-4 sm:mb-6">
            <ShoppingBag className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
          </div>
          <h2 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">No items found</h2>
          <p className="text-muted-foreground mb-6 text-center max-w-sm text-xs sm:text-sm">
            Looks like you haven't added anything to your wishlist yet.
            Start exploring our shop to find something you'll love!
          </p>
          <Button
            asChild
            size="sm"
            className="rounded-full px-6 sm:px-8 font-bold text-xs sm:text-sm h-9 sm:h-11"
          >
            <Link href="/shop">Go to Shop</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

