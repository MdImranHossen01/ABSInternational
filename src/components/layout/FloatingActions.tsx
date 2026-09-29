'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, ShoppingCart } from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import { CartDrawer } from '@/components/layout/CartDrawer';

export function FloatingActions() {
  const [mounted, setMounted] = useState(false);
  const cartCount = useAppSelector((state) => state.cart.totalQuantity);
  const wishlistCount = useAppSelector((state) => state.wishlist.items.length);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="fixed right-0 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-0 shadow-2xl">
      {/* Wishlist */}
      <Link
        href="/dashboard/wishlist"
        aria-label="Wishlist"
        className="relative flex flex-col items-center justify-center w-9 h-10 md:w-12 md:h-14 bg-card border border-border border-r-0 rounded-tl-2xl hover:bg-primary hover:text-primary-foreground transition-all duration-300 group"
      >
        <Heart
          className={`h-4 w-4 md:h-5 md:w-5 transition-all duration-300 group-hover:scale-110 ${mounted && wishlistCount > 0 ? 'fill-primary text-primary group-hover:fill-primary-foreground group-hover:text-primary-foreground' : 'text-foreground'}`}
        />
        {mounted && wishlistCount > 0 && (
          <span className="absolute top-1 left-1 h-3.5 w-3.5 md:h-4 md:w-4 bg-primary group-hover:bg-primary-foreground text-[8px] md:text-[9px] font-black text-primary-foreground group-hover:text-primary rounded-full flex items-center justify-center transition-colors duration-300">
            {wishlistCount}
          </span>
        )}
      </Link>

      {/* Divider */}
      <div className="h-px bg-border" />

      {/* Cart */}
      <CartDrawer>
        <div
          aria-label="Cart"
          role="button"
          className="relative flex flex-col items-center justify-center w-9 h-10 md:w-12 md:h-14 bg-card border border-border border-t-0 border-r-0 rounded-bl-2xl hover:bg-primary hover:text-primary-foreground transition-all duration-300 group cursor-pointer"
        >
          <ShoppingCart className="h-4 w-4 md:h-5 md:w-5 transition-all duration-300 group-hover:scale-110 text-foreground group-hover:text-primary-foreground" />
          {mounted && cartCount > 0 && (
            <span className="absolute top-1 left-1 h-3.5 w-3.5 md:h-4 md:w-4 bg-primary group-hover:bg-primary-foreground text-[8px] md:text-[9px] font-black text-primary-foreground group-hover:text-primary rounded-full flex items-center justify-center transition-colors duration-300">
              {cartCount}
            </span>
          )}
        </div>
      </CartDrawer>
    </div>
  );
}
