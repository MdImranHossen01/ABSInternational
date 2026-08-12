'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Eye, X, ZoomIn, Grid, Image as ImageIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface GalleryItem {
  id: string;
  title: string;
  category: 'products' | 'events' | 'outlets' | 'wellness';
  imageUrl: string;
  caption: string;
}

const galleryItems: GalleryItem[] = [
  {
    id: '1',
    title: 'Immunity & Wellness Tinctures',
    category: 'products',
    imageUrl: 'https://images.unsplash.com/photo-1608248597260-281b37805178?auto=format&fit=crop&w=800&q=80',
    caption: '100% Organic Ayurvedic & Herbal Extracts for Natural Health Support.',
  },
  {
    id: '2',
    title: 'ABS Shop Grand Opening Event',
    category: 'events',
    imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80',
    caption: 'Celebrating our new outlet launch with honorable community leaders and members.',
  },
  {
    id: '3',
    title: 'ABS International Experience Center',
    category: 'outlets',
    imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
    caption: 'Our flagship retail store & customer wellness lounge.',
  },
  {
    id: '4',
    title: 'Vitality Blend Oils',
    category: 'products',
    imageUrl: 'https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&w=800&q=80',
    caption: 'Cold-pressed essential oils crafted for daily rejuvenation.',
  },
  {
    id: '5',
    title: 'Annual Leadership Summit 2026',
    category: 'events',
    imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
    caption: 'Honoring top performance achievement awards and Director rank promotions.',
  },
  {
    id: '6',
    title: 'Organic Herbal Teas & Supplements',
    category: 'wellness',
    imageUrl: 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&w=800&q=80',
    caption: 'Pure botanical blends curated for holistic mind and body wellness.',
  },
  {
    id: '7',
    title: 'Modern Distribution Warehouse',
    category: 'outlets',
    imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
    caption: 'State-of-the-art fulfillment and quality check hub.',
  },
  {
    id: '8',
    title: 'Member Recognition & Charity Drive',
    category: 'events',
    imageUrl: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=800&q=80',
    caption: 'Extending 1% Charity Fund support to underprivileged families.',
  },
  {
    id: '9',
    title: 'Skincare & Radiant Serums',
    category: 'products',
    imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80',
    caption: 'Dermatologically tested natural skincare range.',
  },
];

const categories = [
  { id: 'all', label: 'All Photos' },
  { id: 'products', label: 'Products' },
  { id: 'events', label: 'Events & Summits' },
  { id: 'outlets', label: 'Shops & Outlets' },
  { id: 'wellness', label: 'Health & Wellness' },
];

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);

  const filteredItems = activeCategory === 'all'
    ? galleryItems
    : galleryItems.filter((item) => item.category === activeCategory);

  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-4 md:px-8 container mx-auto">
      {/* Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-3xl mx-auto space-y-4 mb-12"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-extrabold uppercase tracking-widest">
          <Sparkles className="h-4 w-4" /> Visual Showcase
        </div>
        <h1 className="text-3xl md:text-5xl font-black tracking-tight">
          ABS International <span className="text-primary">Gallery</span>
        </h1>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
          Explore our premium wellness products, shop outlets, member recognition summits, and community events across Bangladesh.
        </p>
      </motion.div>

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3 mb-10">
        {categories.map((cat) => (
          <Button
            key={cat.id}
            variant={activeCategory === cat.id ? 'default' : 'outline'}
            onClick={() => setActiveCategory(cat.id)}
            className={`rounded-full px-5 py-2 text-xs md:text-sm font-bold transition-all ${
              activeCategory === cat.id
                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-105'
                : 'hover:border-primary/50'
            }`}
          >
            {cat.id === 'all' && <Grid className="mr-2 h-4 w-4" />}
            {cat.label}
          </Button>
        ))}
      </div>

      {/* Gallery Grid */}
      <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        <AnimatePresence>
          {filteredItems.map((item) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4 }}
              key={item.id}
              className="group relative bg-card border border-border rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer"
              onClick={() => setSelectedImage(item)}
            >
              {/* Image Container */}
              <div className="relative h-64 md:h-72 w-full overflow-hidden bg-muted">
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
                
                {/* Top Badge */}
                <div className="absolute top-4 left-4 z-10">
                  <Badge className="bg-background/80 backdrop-blur-md text-foreground font-bold text-[10px] uppercase tracking-wider border border-border/50">
                    {item.category}
                  </Badge>
                </div>

                {/* Hover Action Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                  <div className="h-12 w-12 rounded-full bg-primary/90 text-white flex items-center justify-center shadow-lg transform scale-75 group-hover:scale-100 transition-transform duration-300">
                    <ZoomIn className="h-6 w-6" />
                  </div>
                </div>

                {/* Caption & Title */}
                <div className="absolute bottom-0 inset-x-0 p-5 z-10 text-white space-y-1">
                  <h3 className="text-lg font-bold group-hover:text-primary transition-colors leading-tight">
                    {item.title}
                  </h3>
                  <p className="text-xs text-white/80 line-clamp-2 leading-relaxed">
                    {item.caption}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Lightbox / Modal Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative max-w-4xl w-full bg-card rounded-3xl overflow-hidden border border-border shadow-2xl overflow-y-auto max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/60 text-white hover:bg-red-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="relative h-[50vh] md:h-[65vh] w-full bg-black">
                <Image
                  src={selectedImage.imageUrl}
                  alt={selectedImage.title}
                  fill
                  priority
                  className="object-contain"
                />
              </div>

              <div className="p-6 md:p-8 space-y-3 bg-card">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <h2 className="text-2xl font-black text-foreground">{selectedImage.title}</h2>
                  <Badge variant="outline" className="text-xs uppercase font-extrabold tracking-wider border-primary/30 text-primary">
                    {selectedImage.category}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {selectedImage.caption}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
