'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Package,
  Layers,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  ShoppingBag,
  Heart,
  Activity,
  Smile,
  Zap,
  Tag
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function UserPackagesPage() {
  const packages = [
    {
      id: 'basic',
      name: 'ABS Basic Joining Package',
      tagline: 'Ideal for Individuals Starting their Health & Wellness Journey',
      price: 1500,
      pv: 100,
      popular: true,
      features: [
        'Premium Organic Wellness Kit (3 Items)',
        'ABS Digital Seba Health Card',
        '1 Free MBBS Doctor Tele-Consultation',
        'Up to 50% Diagnostic Center Discounts',
        'Full 10-Generation MLM Commission Rights',
        'Direct Sponsor Bonus Eligibility (৳225)',
        'Auto-Profit Matrix Pool Entry',
      ],
      ctaText: 'Go to Dashboard to Activate',
      ctaHref: '/dashboard',
    },
    {
      id: 'vip',
      name: 'ABS VIP Executive Package',
      tagline: 'Complete Family Healthcare & Maximum Business Earnings',
      price: 4500,
      pv: 350,
      popular: false,
      features: [
        'Complete Premium Health & Beauty Hamper (9 Items)',
        '3 Family Member Seba Health Cards',
        'Unlimited Doctor Consultations for 1 Year',
        'Free Ambulance Hotline Priority Dispatch',
        'Triple BV Points for Fast-Track Rank Promotion',
        'VIP E-Store Discount (Extra 10% Off All Purchases)',
        'Direct Access to Leadership Workshops',
      ],
      ctaText: 'Upgrade to VIP Package',
      ctaHref: '/dashboard/wallet?tab=deposit',
    },
  ];

  const productStories = [
    {
      title: 'Herbal Immune Booster Elixir',
      category: 'Health & Wellness',
      desc: 'Formulated with authentic organic spirulina, moringa, and black seed oil to naturally amplify your vitality and daily immune defenses.',
      highlight: '100% Organic & Halal Certified',
      icon: Activity,
    },
    {
      title: 'Glow Radiance Collagen Serum',
      category: 'Beauty & Skincare',
      desc: 'Enriched with botanical peptides and vitamin C, this luxury serum deeply hydrates, restores skin elasticity, and provides an age-defying glow.',
      highlight: 'Dermatologically Tested',
      icon: Sparkles,
    },
    {
      title: 'Daily Detox & Herbal Slim Tea',
      category: 'Wellness & Digestion',
      desc: 'A therapeutic blend of rare green teas and antioxidant herbs that optimizes digestion, burns excess calories, and cleanses body toxins.',
      highlight: 'Zero Caffeine & All Natural',
      icon: Heart,
    },
  ];

  const categories = [
    { name: 'Health & Immunity Supplements', count: 18, link: '/products?category=health' },
    { name: 'Organic Herbal Skincare', count: 24, link: '/products?category=skincare' },
    { name: 'Natural Beauty & Cosmetics', count: 15, link: '/products?category=beauty' },
    { name: 'Herbal Wellness Beverages', count: 9, link: '/products?category=wellness' },
    { name: 'Daily Personal Hygiene & Care', count: 12, link: '/products?category=personal-care' },
  ];

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="rounded-2xl bg-linear-to-r from-teal-600 via-cyan-600 to-primary p-6 text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-teal-300 text-teal-950 font-bold border-0">
                Product Story, Categories & Packages
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">Packages & Product Ecosystem</h1>
            <p className="text-sm opacity-90 mt-1 max-w-2xl">
              Explore ABS International’s scientifically formulated wellness products, specialized product categories, and membership packages.
            </p>
          </div>
          <Link href="/products">
            <Button className="bg-white text-teal-900 hover:bg-white/90 font-bold shadow-md">
              <ShoppingBag className="mr-2 h-4 w-4" /> Visit E-Store
            </Button>
          </Link>
        </div>
      </div>

      <Tabs defaultValue="packages" className="space-y-6">
        <TabsList className="grid grid-cols-3 max-w-md h-auto p-1 bg-muted/60">
          <TabsTrigger value="packages" className="py-2.5 text-xs sm:text-sm font-semibold flex items-center gap-1.5">
            <Package className="h-4 w-4" /> Packages
          </TabsTrigger>
          <TabsTrigger value="story" className="py-2.5 text-xs sm:text-sm font-semibold flex items-center gap-1.5">
            <Sparkles className="h-4 w-4" /> Product Story
          </TabsTrigger>
          <TabsTrigger value="categories" className="py-2.5 text-xs sm:text-sm font-semibold flex items-center gap-1.5">
            <Tag className="h-4 w-4" /> Categories
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: 18. Product Packing / Basic Package / VIP Package */}
        <TabsContent value="packages" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {packages.map((pkg) => (
              <Card
                key={pkg.id}
                className={`relative flex flex-col justify-between overflow-hidden border-2 transition-all ${
                  pkg.popular
                    ? 'border-primary shadow-lg bg-linear-to-b from-primary/[0.03] to-transparent'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                {pkg.popular && (
                  <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] uppercase font-black px-3 py-1 rounded-bl-lg">
                    Recommended
                  </div>
                )}
                <CardHeader>
                  <div className="text-xs uppercase tracking-wider font-bold text-muted-foreground">
                    Membership Package
                  </div>
                  <CardTitle className="text-xl font-black mt-1 text-foreground">{pkg.name}</CardTitle>
                  <CardDescription className="text-xs">{pkg.tagline}</CardDescription>
                  <div className="pt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-black text-primary">৳{pkg.price.toLocaleString()}</span>
                    <span className="text-xs text-muted-foreground font-semibold">/ One-time</span>
                  </div>
                  <Badge variant="secondary" className="w-fit mt-2 font-mono text-[11px]">
                    Point Value: {pkg.pv} PV
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-2.5">
                  <div className="text-xs font-bold text-foreground">Package Inclusions:</div>
                  <ul className="space-y-2">
                    {pkg.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="pt-4 border-t">
                  <Link href={pkg.ctaHref} className="w-full">
                    <Button
                      className={`w-full font-bold h-11 ${
                        pkg.popular ? 'bg-primary text-white hover:bg-primary/90' : 'variant-outline'
                      }`}
                    >
                      {pkg.ctaText} <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* TAB 2: 16. Product Story */}
        <TabsContent value="story" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                The ABS Story: Purity, Health & Beauty Excellence
              </CardTitle>
              <CardDescription>
                Discover the inspiration, scientific craftsmanship, and organic heritage behind our signature formulations.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground leading-relaxed">
                <p>
                  At <strong>ABS International</strong>, we believe genuine well-being begins with nature’s purest essences. Every product in our wellness and aesthetic collection is formulated with pharmaceutical precision and zero harmful parabens or synthetic toxins.
                </p>
                <p>
                  Our R&D team partners with premier organic laboratories to fuse traditional Ayurvedic intelligence with modern anti-aging science, ensuring each application elevates vitality, radiant skin, and balanced living.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                {productStories.map((story, idx) => (
                  <Card key={idx} className="border bg-muted/30">
                    <CardHeader className="pb-2">
                      <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-2">
                        <story.icon className="h-5 w-5" />
                      </div>
                      <Badge variant="outline" className="w-fit text-[10px]">
                        {story.category}
                      </Badge>
                      <CardTitle className="text-sm font-bold mt-1">{story.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-xs text-muted-foreground leading-normal">{story.desc}</p>
                      <div className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                        <ShieldCheck className="h-3.5 w-3.5" /> {story.highlight}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: 17. Product Categories */}
        <TabsContent value="categories" className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {categories.map((cat, idx) => (
              <Card key={idx} className="hover:border-primary/50 transition-all">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <Tag className="h-5 w-5 text-primary" />
                    <Badge variant="secondary" className="font-mono text-xs">
                      {cat.count} Items
                    </Badge>
                  </div>
                  <CardTitle className="text-sm font-bold mt-2">{cat.name}</CardTitle>
                </CardHeader>
                <CardFooter className="pt-2">
                  <Link href={cat.link} className="w-full">
                    <Button variant="ghost" size="sm" className="w-full text-xs text-primary justify-between">
                      Browse Category <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
