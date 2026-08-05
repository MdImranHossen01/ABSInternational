'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowRight, 
  Activity, 
  Sparkles, 
  Network, 
  Heart, 
  ShieldCheck 
} from 'lucide-react';
import TextType from './TextType';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

interface HeroBannerProps {
  brandName: string;
}

export default function HeroBanner({ brandName }: HeroBannerProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

  const slides = [
    {
      title: "Achieve Financial Freedom & Global Ranks",
      desc: "Unlock 10 generations of bonuses, global profit shares, and premium rank rewards like smartphones, bikes, and cars.",
      img: "/assets/images/Banner/hero-mlm-career.webp",
      icon: <Network className="h-10 w-10 text-primary" />,
      gradient: "from-blue-500/20 to-indigo-500/20",
    },
    {
      title: "Secure Family Health with Seba Card",
      desc: "Get monthly free doctor consultations and up to 50% discount on diagnostics & ambulance services.",
      img: "/assets/images/Banner/hero-seba-healthcare.webp",
      icon: <Heart className="h-10 w-10 text-primary" />,
      gradient: "from-rose-500/20 to-pink-500/20",
    },
    {
      title: "Empowering Communities & Charity",
      desc: "We dedicate 1% of every package sale to our Charity Fund to support orphans and underprivileged families.",
      img: "/assets/images/Banner/hero-charity-welfare.webp",
      icon: <Sparkles className="h-10 w-10 text-primary" />,
      gradient: "from-emerald-500/20 to-teal-500/20",
    },
    {
      title: "Premium Wellness & Product Ecosystem",
      desc: "Access premium, high-quality beauty and organic health wellness solutions directly from our network of ABS shops.",
      img: "/assets/images/Banner/hero-wellness-products.webp",
      icon: <ShieldCheck className="h-10 w-10 text-primary" />,
      gradient: "from-purple-500/20 to-violet-500/20",
    },
  ];

  return (
    <section className="relative pt-6 pb-16 md:pt-10 md:pb-24 overflow-hidden border-b border-border bg-background">
      {/* Dynamic background glow based on active index */}
      <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-primary/5 pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* Left Column: Content */}
          <div className="lg:col-span-7 text-left space-y-6">

            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent leading-none">
              Welcome to <br className="hidden md:inline" />
              <span className="text-primary">{brandName}</span>
            </h1>

            {/* Coordinated typing text */}
            <div className="h-16 md:h-20 flex items-center">
              <TextType
                text={slides.map(s => s.title)}
                typingSpeed={50}
                deletingSpeed={30}
                pauseDuration={3000}
                showCursor
                cursorCharacter="|"
                onIndexChange={(index) => setActiveIndex(index)}
                className="text-xl md:text-3xl font-bold text-foreground"
              />
            </div>

            <div className="h-24 md:h-20 flex items-start overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.p
                  key={activeIndex}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="text-base md:text-lg text-muted-foreground max-w-xl leading-relaxed"
                >
                  {slides[activeIndex].desc} Join our growing community to experience financial freedom, premium lifestyle benefits, and exclusive healthcare services.
                </motion.p>
              </AnimatePresence>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-all shadow-lg shadow-primary/20"
              >
                Get Started Now
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-card border border-border text-foreground font-semibold hover:bg-accent transition-all"
              >
                Member Login
              </Link>
            </div>
          </div>

          {/* Right Column: Coordinated Image/Visual Slider */}
          <div className="lg:col-span-5 relative w-full aspect-[4/3] rounded-3xl overflow-hidden border border-border bg-card shadow-2xl">
            {slides.map((slide, idx) => {
              const isActive = idx === activeIndex;
              return (
                <div
                  key={idx}
                  className={`absolute inset-0 w-full h-full transition-all duration-1000 ease-in-out flex flex-col justify-center items-center p-8 ${
                    isActive ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-95 z-0 pointer-events-none'
                  }`}
                >
                  {/* Dynamic blur/gradient placeholder backdrop */}
                  <div className={`absolute inset-0 bg-gradient-to-tr ${slide.gradient} opacity-40 pointer-events-none`} />

                  {/* Dynamic image loading overlay */}
                  <div className="relative w-full h-full flex flex-col items-center justify-center z-10">
                    {!imageErrors[idx] ? (
                      <Image
                        src={slide.img}
                        alt={slide.title}
                        fill
                        priority={idx === 0}
                        className="object-cover rounded-2xl opacity-90 transition-all duration-500 hover:scale-105"
                        onError={() => {
                          setImageErrors(prev => ({ ...prev, [idx]: true }));
                        }}
                      />
                    ) : (
                      /* Fallback card content (rendered when image is not present or loaded) */
                      <div className="text-center p-6 space-y-4 max-w-sm bg-background/80 backdrop-blur-md rounded-2xl border border-border shadow-lg z-10">
                        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                          {slide.icon}
                        </div>
                        <h3 className="text-lg font-bold text-foreground">{slide.title}</h3>
                        <p className="text-xs text-muted-foreground">{slide.desc}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Slider dots indicators */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveIndex(idx)}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    idx === activeIndex ? 'w-8 bg-primary' : 'w-2.5 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
