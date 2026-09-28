'use client';

import Link from 'next/link';
import { Tag, ArrowRight, ShoppingBag } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function ProductCategoriesPage() {
  const categories = [
    { name: 'Health & Immunity Supplements', count: 18, desc: 'Natural multivitamins, black seed extracts, and herbal tonics', link: '/products?category=health' },
    { name: 'Organic Herbal Skincare', count: 24, desc: 'Herbal face washes, brightening serums, and anti-aging creams', link: '/products?category=skincare' },
    { name: 'Natural Beauty & Cosmetics', count: 15, desc: 'Halal-certified lip balms, compacts, and organic foundation', link: '/products?category=beauty' },
    { name: 'Herbal Wellness Beverages', count: 9, desc: 'Slimming herbal teas, detox infusions, and energy botanicals', link: '/products?category=wellness' },
    { name: 'Daily Personal Hygiene & Care', count: 12, desc: 'Neem dental gels, sulfate-free shampoos, and botanical body soaps', link: '/products?category=personal-care' },
    { name: 'Specialty Nutritional Kits', count: 6, desc: 'Curated wellness packages for comprehensive daily balance', link: '/products?category=kits' },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-linear-to-r from-teal-700 via-emerald-700 to-primary p-6 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black">Product Categories</h1>
            <p className="text-xs sm:text-sm opacity-90 mt-1 max-w-xl">
              Browse our diverse wellness categories designed to support vitality, skin health, and daily nutritional balance.
            </p>
          </div>
          <Link href="/products">
            <Button className="bg-white text-primary hover:bg-white/90 font-bold shadow-md">
              <ShoppingBag className="mr-2 h-4 w-4" /> Full E-Store
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat, idx) => (
          <Card key={idx} className="border hover:border-primary/50 transition-all flex flex-col justify-between">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <Tag className="h-5 w-5 text-primary" />
                <Badge variant="secondary" className="font-mono text-xs">{cat.count} Items</Badge>
              </div>
              <CardTitle className="text-base font-bold mt-2">{cat.name}</CardTitle>
              <CardDescription className="text-xs">{cat.desc}</CardDescription>
            </CardHeader>
            <CardFooter className="pt-2 border-t">
              <Link href={cat.link} className="w-full">
                <Button variant="ghost" size="sm" className="w-full text-xs text-primary justify-between">
                  View Products <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
