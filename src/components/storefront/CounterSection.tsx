'use client';

import React, { useEffect, useState, useRef } from 'react';

interface StatItem {
  value: string;
  label: string;
}

const stats: StatItem[] = [
  { value: '10+', label: 'Years of Leadership Excellence' },
  { value: '50+', label: 'Premium Herbal & Wellness Products' },
  { value: '64+', label: 'Districts Courier Network Nationwide' },
  { value: '100%', label: 'Transparent Multi-Wallet Bonus Payout' },
];

function AnimatedCounter({ value }: { value: string }) {
  const [count, setCount] = useState(0);
  const elementRef = useRef<HTMLSpanElement>(null);
  const target = parseInt(value.replace(/[^0-9]/g, ''), 10);
  const suffix = value.replace(/[0-9]/g, '');

  useEffect(() => {
    let observer: IntersectionObserver;
    let animationFrameId: number;

    const startAnimation = () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      const duration = 1500; // 1.5s
      const startTime = performance.now();

      const updateCount = (now: number) => {
        const progress = Math.min((now - startTime) / duration, 1);
        // Ease out quad
        const easeProgress = progress * (2 - progress);
        setCount(Math.floor(easeProgress * target));

        if (progress < 1) {
          animationFrameId = requestAnimationFrame(updateCount);
        } else {
          setCount(target);
        }
      };

      animationFrameId = requestAnimationFrame(updateCount);
    };

    if (elementRef.current) {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            startAnimation();
          } else {
            setCount(0);
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
          }
        },
        { threshold: 0.1 }
      );
      observer.observe(elementRef.current);
    }

    return () => {
      if (observer) observer.disconnect();
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [target]);

  return (
    <span ref={elementRef}>
      {count}
      {suffix}
    </span>
  );
}

export function CounterSection() {
  return (
    <section className="py-12 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {stats.map((s, i) => (
            <div key={i} className="p-4 space-y-1">
              <p className="text-4xl md:text-5xl font-black">
                <AnimatedCounter value={s.value} />
              </p>
              <p className="text-sm font-medium text-primary-foreground/70">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default CounterSection;
