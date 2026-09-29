'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  User, 
  LogIn, 
  UserPlus, 
  LayoutDashboard, 
  LogOut, 
  Package, 
  Truck 
} from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function AuthHeaderActions() {
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    let isMounted = true;
    if (status === 'authenticated' && session?.user) {
      const controller = new AbortController();
      fetch('/api/user/profile', { signal: controller.signal })
        .then((res) => {
          if (!res.ok) throw new Error('Failed to fetch profile');
          return res.json();
        })
        .then((data) => {
          if (isMounted && data) setProfile(data);
        })
        .catch(() => {});
      return () => {
        isMounted = false;
        controller.abort();
      };
    } else {
      setProfile(null);
    }
  }, [status, session]);

  return (
    <div className="absolute top-4 right-4 sm:top-6 sm:right-6 md:top-8 md:right-8 z-30 flex items-center">
      {/* Profile Icon Dropdown Menu */}
      {status === 'authenticated' && session?.user ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-[#12141a]/80 backdrop-blur-md border border-neutral-800 hover:border-[#dfb248]/50 transition-all cursor-pointer outline-none group shadow-sm"
              aria-label="Account menu"
            >
              <div className="h-7 w-7 rounded-full border border-[#dfb248]/50 overflow-hidden group-hover:border-[#dfb248] transition-all">
                <Image
                  src={session.user?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(session.user?.name || 'U')}&background=dfb248&color=000`}
                  alt={session.user?.name || 'User'}
                  width={28}
                  height={28}
                  className="h-full w-full object-cover"
                />
              </div>
              <span className="hidden sm:block text-xs font-bold text-slate-200 group-hover:text-[#dfb248] transition-colors">
                {session.user?.name?.split(' ')[0]}
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 mt-2 bg-[#12141a] border border-[#dfb248]/30 text-slate-100 backdrop-blur-md shadow-2xl">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-sans">
                <div className="flex flex-col">
                  <span className="font-bold text-white">{session.user?.name}</span>
                  <span className="text-xs font-normal text-neutral-400 truncate">{session.user?.email}</span>
                  {profile && (
                    <div className="mt-1.5 flex items-center gap-1.5 bg-[#dfb248]/15 px-2 py-0.5 rounded-full w-fit border border-[#dfb248]/30">
                      <Package className="h-3 w-3 text-[#dfb248]" />
                      <span className="text-[10px] font-bold text-[#dfb248]">৳{profile.walletBalance || 0} Tokens</span>
                    </div>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-neutral-800" />

              {/* Role Based Navigation */}
              {((session.user as any)?.role === 'super_admin' || (session.user as any)?.role === 'admin' || (session.user as any)?.role === 'manager') && (
                <DropdownMenuItem asChild>
                  <Link href="/admin/dashboard" className="cursor-pointer flex items-center gap-2 hover:bg-[#dfb248]/15 hover:text-[#dfb248] text-slate-200">
                    <LayoutDashboard className="h-4 w-4 text-[#dfb248]" /> Admin Dashboard
                  </Link>
                </DropdownMenuItem>
              )}

              <DropdownMenuItem asChild>
                <Link href="/dashboard" className="cursor-pointer flex items-center gap-2 hover:bg-[#dfb248]/15 hover:text-[#dfb248] text-slate-200">
                  <LayoutDashboard className="h-4 w-4 text-[#dfb248]" /> User Dashboard
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/track-order" className="cursor-pointer flex items-center gap-2 hover:bg-[#dfb248]/15 hover:text-[#dfb248] text-slate-200">
                  <Truck className="h-4 w-4 text-[#dfb248]" /> Track Order
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="bg-neutral-800" />
            <DropdownMenuItem onClick={() => signOut({ callbackUrl: window.location.origin })} className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 cursor-pointer flex items-center gap-2">
              <LogOut className="h-4 w-4" /> Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="h-10 w-10 flex items-center justify-center rounded-xl bg-[#12141a]/80 backdrop-blur-md border border-neutral-800 hover:border-[#dfb248]/50 text-slate-200 hover:text-[#dfb248] transition-all cursor-pointer outline-none shadow-sm"
              aria-label="User account"
            >
              <User className="h-5 w-5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 p-1.5 shadow-2xl border border-[#dfb248]/30 bg-[#12141a] text-slate-100 backdrop-blur-md">
            <DropdownMenuItem asChild>
              <Link href="/login" className="flex items-center gap-2.5 font-semibold cursor-pointer py-2 px-3 rounded-lg hover:bg-[#dfb248]/15 hover:text-[#dfb248] text-slate-200 transition-colors">
                <LogIn className="h-4 w-4 text-[#dfb248]" />
                <span>Login</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/register" className="flex items-center gap-2.5 font-semibold cursor-pointer py-2 px-3 rounded-lg hover:bg-[#dfb248]/15 hover:text-[#dfb248] text-slate-200 transition-colors">
                <UserPlus className="h-4 w-4 text-[#dfb248]" />
                <span>Register</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
