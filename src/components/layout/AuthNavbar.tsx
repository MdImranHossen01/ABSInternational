'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { User, Menu, X } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useSettings } from '@/components/SettingsProvider';

export function AuthNavbar() {
  const { data: session } = useSession();
  const { brandName, logoUrl } = useSettings();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const finalBrandName = brandName || 'ABS International';
  const finalLogoUrl = logoUrl || '/logo.webp';

  const navLinks = [
    { label: 'HOME', href: '/' },
    { label: 'PLAN', href: '/shop' },
    { label: 'ABOUT US', href: '/about' },
    { label: 'FAQ', href: '/#faq' },
    { label: 'CONTACT', href: '/contact' },
  ];

  return (
    <header className="w-full z-40 bg-black/40 backdrop-blur-md border-b border-amber-500/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Left: Golden Logo Emblem */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative size-11 md:size-12 rounded-full p-0.5 bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-200 shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform overflow-hidden">
            <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden">
              <Image
                src={finalLogoUrl}
                alt={finalBrandName}
                width={44}
                height={44}
                className="object-contain p-1"
                priority
              />
            </div>
          </div>
          <span className="text-amber-400 font-extrabold text-base md:text-lg tracking-wider hidden sm:inline uppercase">
            {finalBrandName}
          </span>
        </Link>

        {/* Center: Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 lg:gap-10">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-[#dfb248] hover:text-amber-200 text-xs lg:text-sm font-bold tracking-widest transition-colors uppercase"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right: User Profile Icon */}
        <div className="flex items-center gap-3">
          <Link
            href={session?.user ? '/dashboard' : '/login'}
            aria-label="Account Profile"
            className="flex items-center justify-center size-10 rounded-full border border-amber-400/60 text-amber-400 hover:text-amber-300 hover:border-amber-400 hover:shadow-lg hover:shadow-amber-500/20 transition-all bg-black/50"
          >
            <User className="size-5" />
          </Link>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-amber-400 hover:text-amber-300"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0c0d12]/95 border-b border-amber-500/20 px-6 py-4 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block text-[#dfb248] hover:text-amber-200 text-sm font-bold tracking-widest uppercase py-1.5"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
