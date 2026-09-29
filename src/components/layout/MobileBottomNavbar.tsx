'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  ShoppingBag,
  ShoppingCart,
  Search,
  X,
  Sun,
  Moon
} from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import { CartDrawer } from '@/components/layout/CartDrawer';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';

export function MobileBottomNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { totalQuantity: cartCount } = useAppSelector((state) => state.cart);
  const { setTheme, resolvedTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/shop', label: 'shop', icon: ShoppingBag },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchTerm.trim())}`);
      setIsSearchOpen(false);
      setSearchTerm('');
    }
  };

  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[100] bg-background border-t border-muted/50 pb-[env(safe-area-inset-bottom,1.5rem)]">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={`Go to ${item.label}`}
                className={`flex flex-col items-center justify-center gap-1 min-w-[64px] transition-all relative ${
                  isActive ? 'text-primary scale-110' : 'text-muted-foreground'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-[1.5px]'}`} />
                {isActive && (
                  <motion.div
                    layoutId="bottom-nav-indicator"
                    className="absolute -bottom-0.5 w-8 h-0.5 bg-primary rounded-full"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}

          {/* Cart Item */}
          <CartDrawer>
            <div 
              aria-label="Open cart drawer"
              role="button"
              className="flex flex-col items-center justify-center gap-1 min-w-[64px] text-muted-foreground relative cursor-pointer active:scale-95 transition-transform"
            >
              <div className="relative">
                <ShoppingCart className="h-5 w-5 stroke-[1.5]" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 h-4 w-4 bg-primary text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-background">
                    {cartCount}
                  </span>
                )}
              </div>
            </div>
          </CartDrawer>

          {/* Search Item */}
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            aria-label="Search products"
            className="flex flex-col items-center justify-center gap-1 min-w-[64px] text-muted-foreground hover:text-foreground active:scale-95 transition-transform"
          >
            <Search className="h-5 w-5 stroke-[1.5]" />
          </button>

          {/* Theme Toggle Item */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="flex flex-col items-center justify-center gap-1 min-w-[64px] text-muted-foreground hover:text-foreground active:scale-95 transition-transform relative"
          >
            <Sun className="h-5 w-5 stroke-[1.5] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 stroke-[1.5] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </button>
        </div>
      </nav>

      {/* Mobile Search Overlay */}
      <Sheet open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <SheetContent side="bottom" className="h-[200px] rounded-t-[2rem] border-t-0 p-6 bg-background z-[150]">
          <SheetHeader className="mb-4">
            <SheetTitle className="text-center text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground">
              Search Products
            </SheetTitle>
          </SheetHeader>
          <form onSubmit={handleSearch} className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
              autoFocus
              type="text"
              placeholder="What are you looking for?"
              className="w-full bg-muted/50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}
