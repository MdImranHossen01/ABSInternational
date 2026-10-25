"use client";

import { useState, useEffect } from 'react';
import { useSession, signOut, signIn } from 'next-auth/react';
import { User, LogOut, Bell, ShieldCheck, Menu, UserPlus, Copy, Check, ShieldAlert, ArrowLeftRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/mode-toggle';
import { SidebarTrigger } from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function UserTopbar() {
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === 'admin' || (session?.user as any)?.role === 'super_admin';
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [profile, setProfile] = useState<any>(null);
  const [copiedId, setCopiedId] = useState(false);
  const [isImpersonated, setIsImpersonated] = useState<boolean>(() => Boolean((session?.user as any)?.isImpersonated));
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if ((session?.user as any)?.isImpersonated) {
      setIsImpersonated(true);
    }
    // Also verify from status API
    fetch('/api/admin/impersonate/status')
      .then((res) => res.json())
      .then((data) => {
        if (data.isImpersonated) setIsImpersonated(true);
      })
      .catch(() => {});
  }, [session?.user]);

  const handleExitImpersonation = async () => {
    setIsExiting(true);
    try {
      const res = await fetch('/api/admin/impersonate/exit', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to exit impersonation');
      }

      const signResult = await signIn('credentials', {
        impersonationToken: data.token,
        redirect: false,
      });

      if (signResult?.error) {
        throw new Error(signResult.error);
      }

      toast.success('Returned to Admin Dashboard');
      window.location.href = '/admin/users';
    } catch (err: any) {
      toast.error(err.message || 'Failed to return to admin');
      setIsExiting(false);
    }
  };

  useEffect(() => {
    if (!session?.user) return;

    let isMounted = true;
    async function fetchUserData() {
      try {
        const [notifRes, profileRes] = await Promise.all([
          fetch('/api/user/notifications?limit=1'),
          fetch('/api/user/profile')
        ]);
        if (isMounted && notifRes.ok) {
          const data = await notifRes.json();
          setUnreadCount(typeof data.unreadCount === 'number' ? data.unreadCount : 0);
        }
        if (isMounted && profileRes.ok) {
          const pData = await profileRes.json();
          setProfile(pData);
        }
      } catch {
        // silent fallback
      }
    }
    fetchUserData();
    const interval = setInterval(fetchUserData, 45000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [session?.user]);

  const handleCopyId = async (id: string) => {
    if (!id) return;
    try {
      await navigator.clipboard.writeText(id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } catch {
      // silent fallback
    }
  };

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6 justify-between sticky top-0 z-30">
      <div className="flex items-center gap-4">
        {/* Mobile hamburger */}
        <SidebarTrigger className="md:hidden" aria-label="Open sidebar menu">
          <Menu className="h-5 w-5" />
        </SidebarTrigger>
      </div>

      {/* Desktop spacer */}
      <div className="hidden md:flex flex-1" />

      <div className="flex items-center gap-3">

        <Link href="/dashboard/notifications">
          <Button variant="ghost" size="icon" className="relative rounded-full" title="Notifications">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white shadow-sm animate-in zoom-in-50">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Button>
        </Link>

        <ModeToggle />

        {session?.user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                className={`rounded-full overflow-hidden border ${
                  isImpersonated
                    ? 'border-amber-500 ring-2 ring-amber-500/60 ring-offset-2'
                    : 'border-primary/20'
                }`}
              >
                {session.user.image ? (
                  <Image
                    src={session.user.image}
                    alt={session.user.name || "User"}
                    width={40}
                    height={40}
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <User className="h-5 w-5" />
                )}
                <span className="sr-only">User menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className={`w-64 p-2 shadow-xl ${isImpersonated ? 'border-amber-500/30' : ''}`}>
              {isImpersonated && (
                <>
                  <div className="p-3 mb-2 rounded-xl bg-gradient-to-br from-amber-500/15 via-amber-500/10 to-amber-500/5 border border-amber-500/30 text-xs shadow-xs">
                    <div className="flex items-center gap-1.5 font-bold text-amber-700 dark:text-amber-400 mb-1">
                      <ShieldAlert className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400 animate-pulse" />
                      <span>Admin Impersonation</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-snug">
                      You are currently viewing as:
                    </p>
                    <p className="text-xs font-bold text-foreground truncate mt-0.5">
                      {session.user.name}
                    </p>
                    {(profile?.memberId || (session.user as any)?.memberId) && (
                      <p className="text-[10px] font-mono font-bold text-amber-700 dark:text-amber-400">
                        {profile?.memberId || (session.user as any)?.memberId}
                      </p>
                    )}
                    <Button
                      type="button"
                      onClick={handleExitImpersonation}
                      disabled={isExiting}
                      size="sm"
                      className="w-full mt-2.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white font-bold text-xs shadow-xs rounded-lg cursor-pointer h-8 gap-1.5"
                    >
                      {isExiting ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span>Returning...</span>
                        </>
                      ) : (
                        <>
                          <ArrowLeftRight className="h-3.5 w-3.5" />
                          <span>Return to Admin Dashboard</span>
                        </>
                      )}
                    </Button>
                  </div>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuGroup>
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-bold leading-none">{session.user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis">
                      {session.user.email}
                    </p>
                    {(profile?.memberId || (session.user as any)?.memberId) && (
                      <div className="flex items-center justify-between gap-1.5 mt-2 pt-2 border-t border-border/60">
                        <div className="flex items-center gap-1 text-[11px] font-mono">
                          <span className="text-muted-foreground font-sans">ID:</span>
                          <span className="font-bold text-foreground">
                            {profile?.memberId || (session.user as any)?.memberId}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleCopyId(profile?.memberId || (session.user as any)?.memberId);
                          }}
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-secondary hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
                          title="Copy Member ID"
                        >
                          {copiedId ? (
                            <>
                              <Check className="h-3 w-3 text-emerald-500" />
                              <span className="text-emerald-500 font-semibold">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3 text-muted-foreground" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/profile">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              {isAdmin && !isImpersonated && (
                <DropdownMenuItem asChild>
                  <Link href="/admin/dashboard" className="text-amber-700 dark:text-amber-300 font-semibold">
                    <ShieldCheck className="mr-2 h-4 w-4 text-amber-600" />
                    <span>System Dashboard</span>
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem asChild>
                <Link href="/register">
                  <UserPlus className="mr-2 h-4 w-4" />
                  <span>Register</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => signOut({ callbackUrl: window.location.origin })}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button variant="secondary" size="icon" className="rounded-full">
            <User className="h-5 w-5" />
          </Button>
        )}
      </div>
    </header>
  );
}
