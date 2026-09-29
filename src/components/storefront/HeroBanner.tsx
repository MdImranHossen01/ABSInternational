'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowRight, 
  Sparkles, 
  Network, 
  Heart, 
  ShieldCheck, 
  ChevronDown 
} from 'lucide-react';
import TextType from './TextType';
import { motion, AnimatePresence } from 'framer-motion';

interface HeroBannerProps {
  brandName: string;
}

export default function HeroBanner({ brandName }: HeroBannerProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const slides = [
    {
      title: "Achieve Financial Freedom & Global Ranks",
      badgeTitle: "Financial Freedom",
      desc: "Unlock 10 generations of bonuses, global profit shares, and premium rank rewards like smartphones, bikes, and cars.",
      img: "/assets/images/Banner/hero-mlm-career.webp",
      icon: <Network className="h-6 w-6 text-black" />,
      subtext: "10-Generation MLM Rewards",
    },
    {
      title: "Secure Family Health with Seba Card",
      badgeTitle: "Family Healthcare",
      desc: "Get monthly free doctor consultations and up to 50% discount on diagnostics & ambulance services nationwide.",
      img: "/assets/images/Banner/hero-seba-healthcare.webp",
      icon: <Heart className="h-6 w-6 text-black" />,
      subtext: "24/7 Dedicated Care",
    },
    {
      title: "Empowering Communities & Charity Fund",
      badgeTitle: "Community & Charity",
      desc: "We dedicate 1% of every package sale to our Charity Fund to support orphans and underprivileged families across Bangladesh.",
      img: "/assets/images/Banner/hero-charity-welfare.webp",
      icon: <Sparkles className="h-6 w-6 text-black" />,
      subtext: "Making an Impact Together",
    },
    {
      title: "Premium Wellness & Product Ecosystem",
      badgeTitle: "Wellness Ecosystem",
      desc: "Access premium, high-quality beauty and organic health wellness solutions directly from our network of ABS shops.",
      img: "/assets/images/Banner/hero-wellness-products.webp",
      icon: <ShieldCheck className="h-6 w-6 text-black" />,
      subtext: "100% Certified Organic",
    },
  ];

  // Auto-rotate background & showcase slides like CareHive
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 6000);
    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <section className="relative min-h-[90vh] lg:min-h-screen flex items-center pt-8 sm:pt-12 md:pt-16 pb-16 md:pb-24 overflow-hidden bg-[#07080e]">
      
      {/* ── Background Image Carousel with smooth crossfade (CareHive structure) ── */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === activeIndex ? "opacity-100" : "opacity-0"
            }`}
          >
            <Image
              src={slide.img}
              alt={slide.title}
              fill
              priority={index === 0}
              className="w-full h-full object-cover scale-105"
            />
            {/* Deep cinematic gradient overlay for readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/85 to-black/70 mix-blend-multiply" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#07080e] via-black/40 to-black/80" />
          </div>
        ))}
      </div>

      {/* Animated ambient gradient pulse overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-primary/15 z-0 pointer-events-none" />

      {/* Hexagonal overlay for brand aesthetic */}
      <svg 
        className="absolute inset-0 w-full h-full opacity-[0.10] pointer-events-none z-0" 
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <pattern id="hero-hex-pattern" width="56" height="96.995" patternUnits="userSpaceOnUse">
            <path
              d="M 28 0 L 56 16.166 L 56 48.497 L 28 64.663 L 0 48.497 L 0 16.166 Z M 0 64.663 L 28 80.83 L 28 113.16 L 0 129.33 L -28 113.16 L -28 80.83 Z M 56 64.663 L 84 80.83 L 84 113.16 L 56 129.33 L 28 113.16 L 28 80.83 Z"
              fill="none"
              stroke="#fbbf24"
              strokeWidth="0.8"
              strokeOpacity="0.4"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hero-hex-pattern)" />
      </svg>

      <style jsx>{`
        /* Animate gradient for color-changing effect (from CareHive) */
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-animated {
          background-image: linear-gradient(
            90deg,
            #f59e0b,
            #fde047,
            #10b981,
            #38bdf8,
            #f59e0b
          );
          background-size: 300% 300%;
          animation: gradientShift 6s ease infinite;
        }
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        .animate-float {
          animation: floatSlow 3.5s ease-in-out infinite;
        }
      `}</style>

      {/* ── Main Container (CareHive 2-Column Hero) ── */}
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          
          {/* Left Column: Text, CTAs, and Stats */}
          <div className="lg:col-span-7 text-center md:text-left space-y-6">
            
            {/* Eyebrow badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs sm:text-sm font-semibold text-amber-300 shadow-md">
              <Sparkles className="size-4 text-amber-400 animate-pulse" />
              <span>Welcome to {brandName} Platform</span>
            </div>

            {/* CareHive-style Headline with Animated Gradient Highlight */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white font-black leading-tight tracking-tight drop-shadow-xl">
              Your Journey to{' '}
              <span className="text-transparent bg-clip-text animate-gradient-animated font-black">
                Financial Freedom
              </span>{' '}
              Starts Here
            </h1>

            {/* Coordinated typing text */}
            <div className="min-h-[2.5rem] sm:min-h-[3rem] flex items-center justify-center md:justify-start">
              <TextType
                text={slides.map(s => s.title)}
                typingSpeed={45}
                deletingSpeed={25}
                pauseDuration={3200}
                showCursor
                cursorCharacter="|"
                onIndexChange={(index) => setActiveIndex(index)}
                className="text-lg sm:text-xl md:text-2xl font-bold text-amber-300 drop-shadow"
              />
            </div>

            {/* Glassmorphic Description Card (CareHive style) */}
            <div className="backdrop-blur-md bg-white/10 dark:bg-black/40 p-4 sm:p-5 rounded-2xl border border-white/20 text-white/90 text-sm sm:text-base md:text-lg leading-relaxed font-light shadow-xl max-w-2xl">
              <AnimatePresence mode="wait">
                <motion.p
                  key={activeIndex}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35 }}
                >
                  {slides[activeIndex].desc} Join our growing community to experience financial freedom, premium lifestyle benefits, and exclusive healthcare services.
                </motion.p>
              </AnimatePresence>
            </div>

            {/* Action Buttons (CareHive Pill Buttons) */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center md:justify-start w-full pt-2">
              <Link
                href="/register"
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:brightness-110 text-black font-extrabold py-3.5 px-8 sm:py-4 sm:px-10 rounded-full text-sm sm:text-base transition-all duration-300 shadow-xl shadow-amber-500/25 transform hover:-translate-y-1 hover:scale-105 whitespace-nowrap"
              >
                <span>Get Started</span>
                <ArrowRight className="size-4 sm:size-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/login"
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-transparent border-2 border-white/70 text-white hover:bg-white hover:text-black font-extrabold py-3.5 px-8 sm:py-4 sm:px-10 rounded-full text-sm sm:text-base transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 whitespace-nowrap backdrop-blur-sm"
              >
                <span>Member Login</span>
              </Link>
            </div>

            {/* ── Stats Section (Exact CareHive 3-Card Layout) ── */}
            <div className="flex flex-wrap justify-center md:justify-start pt-6 gap-4 sm:gap-6 max-w-2xl">
              <div className="text-center backdrop-blur-md bg-white/10 p-3.5 sm:p-4 rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-1 flex-1 min-w-[110px] shadow-lg">
                <div className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-1 drop-shadow-lg">
                  100K+
                </div>
                <div className="text-white/80 text-xs sm:text-sm font-medium tracking-wide">
                  Active Members
                </div>
              </div>

              <div className="text-center backdrop-blur-md bg-white/10 p-3.5 sm:p-4 rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-1 flex-1 min-w-[110px] shadow-lg">
                <div className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-1 drop-shadow-lg">
                  10 Gen
                </div>
                <div className="text-white/80 text-xs sm:text-sm font-medium tracking-wide">
                  Bonus Levels
                </div>
              </div>

              <div className="text-center backdrop-blur-md bg-white/10 p-3.5 sm:p-4 rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-1 flex-1 min-w-[110px] shadow-lg">
                <div className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-1 drop-shadow-lg">
                  24/7
                </div>
                <div className="text-white/80 text-xs sm:text-sm font-medium tracking-wide">
                  Seba Health Support
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Interactive Card Showcase with Dots & Floating Badge (CareHive style) */}
          <div className="lg:col-span-5 relative w-full">
            <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl transform hover:scale-[1.02] transition-transform duration-500 border-4 border-white/20 backdrop-blur-sm bg-black/40">
              
              {/* Slides showcase images */}
              {slides.map((slide, idx) => (
                <div
                  key={idx}
                  className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                    idx === activeIndex ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                  }`}
                >
                  <Image
                    src={slide.img}
                    alt={slide.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 45vw"
                    priority={idx === 0}
                    className="w-full h-full object-cover rounded-3xl"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                </div>
              ))}

              {/* Slide Navigation Dots (CareHive style) */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-2 z-20">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveIndex(index)}
                    aria-label={`Go to slide ${index + 1}`}
                    className={`h-2.5 rounded-full transition-all duration-300 ${
                      index === activeIndex
                        ? "w-8 bg-amber-400 shadow-md scale-110"
                        : "w-2.5 bg-white/50 hover:bg-white/80"
                    }`}
                  />
                ))}
              </div>

              {/* Floating Overlay Badge Card (CareHive animate-float style) */}
              <div className="absolute bottom-6 left-6 right-6 sm:right-auto bg-black/85 backdrop-blur-md p-4 sm:p-5 rounded-2xl shadow-2xl max-w-xs border border-white/20 z-20 animate-float">
                <div className="flex items-center gap-3.5">
                  <div className="bg-gradient-to-tr from-amber-400 to-yellow-200 p-3 rounded-2xl shadow-lg shrink-0 text-black">
                    {slides[activeIndex].icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm sm:text-base line-clamp-1">
                      {slides[activeIndex].badgeTitle}
                    </h3>
                    <p className="text-xs text-amber-300/90 font-medium">
                      {slides[activeIndex].subtext}
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Floating Scroll Down Indicator (CareHive style) */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 animate-bounce z-10 hidden lg:block pointer-events-none">
        <div className="bg-white/20 backdrop-blur-sm p-2 rounded-full border border-white/30 text-white">
          <ChevronDown className="size-5" />
        </div>
      </div>

    </section>
  );
}
